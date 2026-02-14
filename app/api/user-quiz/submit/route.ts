import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiFilter } from "@/lib/ai/aiFilter";
import { getPrismaClient } from "@/lib/prisma";

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, league, category, difficulty, seoDescription, questions } = body;

        // Validation
        if (!title || !league || !category || !difficulty || !seoDescription) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        if (!Array.isArray(questions) || questions.length < 5) {
            return NextResponse.json(
                { error: "At least 5 questions required" },
                { status: 400 }
            );
        }

        // AI Filter - check if content is football-related
        const contentToCheck = `${title} ${league} ${category} ${seoDescription} ${questions
            .map((q: any) => q.question + " " + q.options.map((o: any) => o.text).join(" "))
            .join(" ")}`;

        const filterResult = aiFilter(contentToCheck, "This quiz must be about football only!");

        if (!filterResult.ok) {
            return NextResponse.json({ error: filterResult.error }, { status: 400 });
        }

        // Generate slug
        const baseSlug = slugify(title);
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        // Get Prisma client
        const prisma = getPrismaClient();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Extract keywords from title
        const keywords = title
            .split(/[^a-zA-Z0-9]+/)
            .filter((w: string) => w.length >= 4)
            .slice(0, 10);

        // Create UserQuiz with PENDING status
        const userQuiz = await prisma.userQuiz.create({
            data: {
                slug,
                title,
                league,
                category,
                difficulty,
                seoDescription,
                seoContent: "", // Empty for user-created quizzes
                seoKeywords: [...keywords, league, category, "football quiz"],
                pointsPerCorrect: difficulty === "Easy" ? 10 : difficulty === "Hard" ? 20 : 15,
                timeSeconds: 15,
                questions,
                status: "PENDING",
                creatorId: user.id,
            },
        });

        return NextResponse.json({
            ok: true,
            message: "Quiz submitted for review",
            slug: userQuiz.slug,
        });
    } catch (err) {
        console.error("user-quiz/submit error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}
