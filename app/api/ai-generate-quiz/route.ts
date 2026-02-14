import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiFilter } from "@/lib/ai/aiFilter";
import { getPrismaClient } from "@/lib/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

function slugify(input: string): string {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 80);
}

type AIQuizQuestion = {
    question: string;
    options: Array<{ text: string; funFact: string }>;
    correctIndex: number;
};

async function generateQuizWithAI(
    topic: string,
    category: string
): Promise<AIQuizQuestion[]> {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured");
    }

    const prompt = `You are a professional football quiz generator. Generate exactly 5 high-quality football quiz questions about "${topic}" in the "${category}" category.

STRICT REQUIREMENTS:
- Questions MUST be about football/soccer ONLY
- Questions should be technically accurate and challenging
- Each question has exactly 4 options
- One option is correct, others are plausible distractors
- Include a fun fact for each option (1 sentence)
- Questions should test real football knowledge

Return ONLY valid JSON in this exact format:
[
  {
    "question": "Question text here?",
    "options": [
      { "text": "Option 1", "funFact": "Interesting fact about this option" },
      { "text": "Option 2", "funFact": "Interesting fact about this option" },
      { "text": "Option 3", "funFact": "Interesting fact about this option" },
      { "text": "Option 4", "funFact": "Interesting fact about this option" }
    ],
    "correctIndex": 0
  }
]

NO markdown, NO code blocks, NO explanations. ONLY the JSON array.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                },
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Gemini API error:", error);
            throw new Error("AI generation failed");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            throw new Error("No response from AI");
        }

        // Clean markdown code blocks if present
        let cleanText = text.trim();
        if (cleanText.startsWith("```json")) {
            cleanText = cleanText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (cleanText.startsWith("```")) {
            cleanText = cleanText.replace(/```\n?/g, "");
        }

        const questions = JSON.parse(cleanText) as AIQuizQuestion[];

        // Validate structure
        if (!Array.isArray(questions) || questions.length !== 5) {
            throw new Error("Invalid question format from AI");
        }

        for (const q of questions) {
            if (
                !q.question ||
                !Array.isArray(q.options) ||
                q.options.length !== 4 ||
                typeof q.correctIndex !== "number" ||
                q.correctIndex < 0 ||
                q.correctIndex > 3
            ) {
                throw new Error("Invalid question structure from AI");
            }
        }

        return questions;
    } catch (err) {
        console.error("AI generation error:", err);
        throw new Error("Failed to generate quiz with AI");
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { topic, category } = body;

        // Validation
        if (!topic || !category) {
            return NextResponse.json(
                { error: "Topic and category are required" },
                { status: 400 }
            );
        }

        const validCategories = [
            "LEAGUES",
            "LEGENDS",
            "NOSTALGIA",
            "TACTICS",
            "NATIONS",
            "DERBIES",
            "RECORDS",
            "TOURNAMENTS",
        ];

        if (!validCategories.includes(category)) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        // AI Filter - check if topic is football-related
        const filterResult = aiFilter(topic, "This topic must be about football only!");

        if (!filterResult.ok) {
            return NextResponse.json({ error: filterResult.error }, { status: 400 });
        }

        // Generate quiz with AI
        const questions = await generateQuizWithAI(topic, category);

        // Generate slug and title
        const baseSlug = slugify(topic);
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;
        const title = topic.length > 60 ? topic.slice(0, 60) + "..." : topic;

        // Get Prisma client
        const prisma = getPrismaClient();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Extract keywords from topic
        const keywords = topic
            .split(/[^a-zA-Z0-9]+/)
            .filter((w: string) => w.length >= 4)
            .slice(0, 10);

        // Create UserQuiz with PENDING status
        const userQuiz = await prisma.userQuiz.create({
            data: {
                slug,
                title,
                topic,
                category,
                difficulty: "Medium",
                seoDescription: `Test your knowledge about ${topic}`,
                seoContent: "",
                seoKeywords: [...keywords, category.toLowerCase(), "football quiz", "ai generated"],
                pointsPerCorrect: 15,
                timeSeconds: 15,
                questions,
                status: "PENDING",
                aiGenerated: true,
                creatorId: user.id,
            },
        });

        return NextResponse.json({
            ok: true,
            message: "AI-generated quiz submitted for review",
            slug: userQuiz.slug,
            title: userQuiz.title,
            questionsCount: questions.length,
        });
    } catch (err) {
        console.error("ai-generate-quiz error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}
