"use client";

import { useMemo, useState } from "react";

import { MatchDayQuiz } from "@/components/quiz/MatchDayQuiz";
import { QuizRunner } from "@/components/quiz/QuizRunner";

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

export function QuizStartGate({
    quiz,
    mode,
    allQuizzes,
}: {
    quiz: QuizData;
    mode: "runner" | "matchday";
    allQuizzes?: QuizCatalogEntry[];
}) {
    const [started, setStarted] = useState(false);

    const questionCount = quiz.questions?.length ?? 0;
    const minutes = questionCount ? Math.max(1, Math.ceil((questionCount * 15) / 60)) : 0;

    const seoText = useMemo(() => {
        if (quiz.seoContent?.trim()) return quiz.seoContent;
        return buildSeoText({ quiz, questionCount, minutes });
    }, [quiz, questionCount, minutes]);

    function onStart() {
        const target = document.getElementById("quiz");
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(() => setStarted(true), 350);
    }

    return (
        <>
            <header className={mode === "matchday" ? "mx-auto max-w-4xl" : "mx-auto max-w-3xl"}>
                <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8">
                    {mode === "matchday" ? (
                        <div className="inline-flex items-center gap-2 rounded-full bg-pitch-green/10 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                            Match Day Mode
                        </div>
                    ) : (
                        <div className="inline-flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-pitch-green/10 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                                {quiz.league}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-var-blue/10 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                                {quiz.category}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-referee-yellow/20 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                                {quiz.difficulty}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-emerald-950/5 px-3 py-1 text-xs font-semibold text-emerald-950/80">
                                {quiz.pointsPerCorrect} pts / correct
                            </span>
                        </div>
                    )}

                    <h1 className="mt-4 text-balance text-4xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.14)] sm:text-5xl">
                        <span className="bg-gradient-to-b from-emerald-950 via-emerald-800 to-emerald-950 bg-clip-text text-transparent drop-shadow-[0_12px_28px_rgba(2,44,34,0.22)]">
                            {quiz.title}
                        </span>
                    </h1>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={onStart}
                            className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-yellow-200 via-referee-yellow to-amber-400 px-7 py-4 text-base font-extrabold tracking-wide text-emerald-950 shadow-[0_26px_90px_rgba(250,204,21,0.35)] ring-1 ring-emerald-950/10 transition-all hover:-translate-y-[2px] hover:shadow-[0_30px_100px_rgba(250,204,21,0.42)] active:translate-y-0 sm:w-auto"
                        >
                            <span className="absolute inset-0 -z-10 rounded-full bg-referee-yellow blur-2xl opacity-70 animate-pulse" />
                            <span className="absolute inset-0 -z-10 bg-gradient-to-b from-white/35 via-transparent to-black/5" />
                            <span className="absolute inset-0 -z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/55 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                            START QUIZ
                        </button>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm font-semibold text-emerald-950/85 sm:grid-cols-3">
                        <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-950/10 bg-white/70 px-4 py-3 shadow-[0_18px_60px_rgba(2,44,34,0.08)]">
                            <span className="text-base">🧩</span>
                            <span>{questionCount} Questions</span>
                        </div>
                        <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-950/10 bg-white/70 px-4 py-3 shadow-[0_18px_60px_rgba(2,44,34,0.08)]">
                            <span className="text-base">⏱️</span>
                            <span>{minutes} Mins</span>
                        </div>
                        <div className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-950/10 bg-white/70 px-4 py-3 shadow-[0_18px_60px_rgba(2,44,34,0.08)]">
                            <span className="text-base">🏆</span>
                            <span>{quiz.difficulty || "Professional"}</span>
                        </div>
                    </div>

                    <div className="mt-5 rounded-3xl border border-emerald-950/10 bg-white/60 p-5 shadow-[0_18px_60px_rgba(2,44,34,0.08)] backdrop-blur">
                        <p className="whitespace-pre-line text-base leading-8 text-emerald-950/80">{seoText}</p>
                    </div>
                </div>
            </header>

            <section id="quiz" className="mt-10 scroll-mt-24">
                {started ? (
                    mode === "matchday" ? (
                        <MatchDayQuiz quiz={quiz} allQuizzes={allQuizzes} />
                    ) : (
                        <QuizRunner quiz={quiz} allQuizzes={allQuizzes} />
                    )
                ) : null}
            </section>
        </>
    );
}
