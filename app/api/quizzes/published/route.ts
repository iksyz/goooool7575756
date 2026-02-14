import { NextRequest, NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

/**
 * GET /api/quizzes/published
 * 
 * Returns ONLY PUBLISHED user-generated quizzes
 * SECURITY: status: "PUBLISHED" filter enforced
 */
export async function GET(req: NextRequest) {
    try {
        const prisma = getPrismaClient();

        // SECURITY: Fetch ONLY PUBLISHED user quizzes
        const userQuizzes = await prisma.userQuiz.findMany({
            where: {
                status: "PUBLISHED", // SECURITY FILTER
            },
            select: {
                slug: true,
                title: true,
                topic: true,
                category: true,
                difficulty: true,
                seoDescription: true,
                pointsPerCorrect: true,
                timeSeconds: true,
                questions: true,
                seoKeywords: true,
                seoContent: true,
                aiGenerated: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({
            ok: true,
            count: userQuizzes.length,
            quizzes: userQuizzes,
        });
    } catch (err) {
        console.error("quizzes/published error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}
