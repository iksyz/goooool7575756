import quizzes from "@/data/quizzes.json";
import { getPrismaClient } from "@/lib/prisma";

export type QuizData = {
    slug: string;
    title: string;
    league?: string; // For JSON quizzes (legacy)
    topic?: string; // For DB quizzes (new)
    category: string;
    difficulty: string;
    seoDescription: string;
    seoContent?: string;
    seoKeywords?: string[];
    pointsPerCorrect: number;
    timeSeconds?: number;
    questions: Array<{
        question: string;
        options: Array<{ text: string; funFact: string }>;
        correctIndex: number;
    }>;
};

/**
 * Fetch quiz from both JSON file and database (PUBLISHED user quizzes ONLY)
 * 
 * SECURITY: Only PUBLISHED status quizzes are returned
 */
export async function getQuizBySlug(slug: string): Promise<QuizData | null> {
    // First, check JSON quizzes
    const jsonQuizzes = quizzes as unknown as QuizData[];
    const jsonQuiz = jsonQuizzes.find((q) => q.slug === slug);

    if (jsonQuiz) {
        return jsonQuiz;
    }

    // Then, check database for PUBLISHED user quizzes
    try {
        const prisma = getPrismaClient();
        const userQuiz = await prisma.userQuiz.findFirst({
            where: {
                slug,
                status: "PUBLISHED", // SECURITY: Only published quizzes
            },
            select: {
                slug: true,
                title: true,
                topic: true,
                category: true,
                difficulty: true,
                seoDescription: true,
                seoContent: true,
                seoKeywords: true,
                pointsPerCorrect: true,
                timeSeconds: true,
                questions: true,
            },
        });

        if (!userQuiz) return null;

        return {
            ...userQuiz,
            topic: userQuiz.topic,
            seoKeywords: userQuiz.seoKeywords as string[],
            questions: userQuiz.questions as any,
        };
    } catch (err) {
        console.error("getQuizBySlug error:", err);
        return null;
    }
}

/**
 * Fetch all quizzes (JSON + PUBLISHED user quizzes ONLY)
 * 
 * SECURITY: Only PUBLISHED status quizzes are returned
 */
export async function getAllQuizzes(): Promise<QuizData[]> {
    const jsonQuizzes = quizzes as unknown as QuizData[];

    try {
        const prisma = getPrismaClient();
        const userQuizzes = await prisma.userQuiz.findMany({
            where: {
                status: "PUBLISHED", // SECURITY: Only published quizzes
            },
            select: {
                slug: true,
                title: true,
                topic: true,
                category: true,
                difficulty: true,
                seoDescription: true,
                seoContent: true,
                seoKeywords: true,
                pointsPerCorrect: true,
                timeSeconds: true,
                questions: true,
            },
            orderBy: { createdAt: "desc" },
        });

        const parsedUserQuizzes: QuizData[] = userQuizzes.map((uq) => ({
            ...uq,
            topic: uq.topic,
            seoKeywords: uq.seoKeywords as string[],
            questions: uq.questions as any,
        }));

        return [...jsonQuizzes, ...parsedUserQuizzes];
    } catch (err) {
        console.error("getAllQuizzes error:", err);
        return jsonQuizzes;
    }
}
