import type { Metadata } from "next";
import { notFound } from "next/navigation";

import quizzes from "@/data/quizzes.json";
import { QuizStartGate } from "@/components/quiz/QuizStartGate";

type QuizOption = {
    text: string;
    funFact: string;
};

type QuizQuestion = {
    question: string;
    options: QuizOption[];
    correctIndex: number;
};

type QuizData = {
    slug: string;
    title: string;
    league: string;
    category: string;
    difficulty: string;
    seoDescription: string;
    seoContent?: string;
    seoKeywords?: string[];
    pointsPerCorrect: number;
    timeSeconds?: number;
    questions: QuizQuestion[];
};

type QuizCatalogEntry = Pick<QuizData, "slug" | "title" | "league" | "category" | "difficulty" | "pointsPerCorrect">;

function titleKeywords(title: string) {
    return title
        .split(/[^a-zA-Z0-9]+/g)
        .map((w) => w.trim())
        .filter((w) => w.length >= 4)
        .map((w) => w.toLowerCase());
}

function uniqueKeywords(list: string[]) {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const k of list) {
        const v = k.trim();
        if (!v) continue;
        const key = v.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(v);
    }
    return out;
}

function buildSeoText({
    quiz,
    questionCount,
    minutes,
}: {
    quiz: QuizData;
    questionCount: number;
    minutes: number;
}) {
    const derived = uniqueKeywords([
        quiz.league,
        quiz.category,
        quiz.difficulty,
        ...titleKeywords(quiz.title),
        ...quiz.slug.split("-").filter((w) => w.length >= 4),
        "football quiz",
        "football trivia",
        "matchday quiz",
        "football knowledge",
        "quiz questions",
        "football facts",
        "football history",
    ]);

    const keywords = uniqueKeywords([...(quiz.seoKeywords ?? []), ...derived]).slice(0, 18);
    const keywordLine = keywords.join(", ");

    const p1 = `If you're searching for a ${quiz.title} experience that feels like real matchday pressure, this is the place to start. This football quiz is built around ${questionCount} quick questions designed to test recall, context, and instinct. You'll see themes connected to ${quiz.league} and ${quiz.category}, but the real goal is deeper: to understand the moments, patterns, and details that define the game. With a focused time window (about ${minutes} minutes total), you get a fast, competitive session that rewards sharp thinking and confident decisions.`;
    const p2 = `This quiz is also crafted for SEO-friendly discoverability and for real fans who want meaningful practice. Instead of random prompts, the question set targets the topics football supporters actually search for: ${quiz.league} trivia, classic moments, key records, famous fixtures, and the context behind iconic outcomes. If your interest is ${quiz.difficulty} difficulty, you'll enjoy the balance between accessible knowledge and the kind of details that separate casual viewers from true students of the sport.`;
    const p3 = `To make every page unique, each quiz has its own keyword focus. For this one, the core keyword cluster includes: ${keywordLine}. Those phrases reflect how fans explore the topic—by competition, era, tactical trend, club legacy, and memorable turning points. As you play, you'll naturally reinforce these concepts through repetition, quick feedback, and high-signal prompts. The result is a football trivia flow that improves recall and makes future matches easier to read.`;
    const p4 = `If you like learning through pressure, timed rounds are ideal. They simulate the snap judgments you make while watching a game: identifying a key record, recalling a season outcome, recognizing a historical milestone, or connecting a player to a defining night. The faster you decide, the clearer your mental map becomes. Over time, that builds stronger football knowledge—useful for debates, match previews, and understanding why certain teams and moments are remembered the way they are.`;
    const p5 = `Ready to play? Hit START QUIZ and jump in. You can treat it as a quick warm-up, a serious challenge run, or a repeatable practice set to master this topic. If you enjoy ${quiz.title}, explore more quizzes across leagues, categories, and difficulty levels. The best way to grow your football IQ is consistent short sessions—learn the facts, absorb the context, and let the stories of the sport stick.`;

    return [p1, p2, p3, p4, p5].join("\n\n");
}

function wordCount(text: string) {
    return text.split(/\s+/).filter(Boolean).length;
}

type PageProps = {
    params: Promise<{ slug: string }>;
};

function getQuiz(slug: string): QuizData | undefined {
    const list = quizzes as unknown as QuizData[];
    return list.find((q) => q.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const quiz = getQuiz(slug);

    if (!quiz) {
        return {
            title: "Quiz Not Found | Goaltrivia",
            description: "Football quiz not found.",
        };
    }

    const questionCount = quiz.questions.length;
    const minutes = Math.max(2, Math.round((questionCount * (quiz.timeSeconds ?? 15)) / 60));
    const seoLong =
        quiz.seoContent && wordCount(quiz.seoContent) >= 400
            ? quiz.seoContent
            : buildSeoText({ quiz, questionCount, minutes });

    return {
        title: `${quiz.title} — Match Day Play | Goaltrivia`,
        description: seoLong,
    };
}

export default async function QuizPlayPage({ params }: PageProps) {
    const { slug } = await params;
    const quiz = getQuiz(slug);

    if (!quiz) notFound();

    const list = quizzes as unknown as QuizData[];
    const catalog: QuizCatalogEntry[] = list.map((q) => ({
        slug: q.slug,
        title: q.title,
        league: q.league,
        category: q.category,
        difficulty: q.difficulty,
        pointsPerCorrect: q.pointsPerCorrect,
    }));

    return (
        <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
            <QuizStartGate quiz={quiz} mode="matchday" allQuizzes={catalog} />
        </main>
    );
}
