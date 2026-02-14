"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { QuizCard } from "@/components/QuizCard";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

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
    league?: string; // For JSON quizzes (legacy)
    topic?: string; // For DB quizzes (new)
    category: string;
    difficulty: string;
    seoDescription: string;
    pointsPerCorrect: number;
    questions: QuizQuestion[];
};

type QuizCatalogEntry = Pick<QuizData, "slug" | "title" | "category" | "difficulty" | "pointsPerCorrect"> & {
    league?: string;
    topic?: string;
};

type Phase = "question" | "feedback" | "result";

type QuizRunnerProps = {
    quiz: QuizData;
    allQuizzes?: QuizCatalogEntry[];
};

function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
}

function hashSeed(input: string) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed: number) {
    return () => {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffleOptions<T>(options: T[], seedKey: string) {
    const rng = mulberry32(hashSeed(seedKey));
    const arr = options.map((value, index) => ({ value, index }));
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

export function QuizRunner({ quiz, allQuizzes }: QuizRunnerProps) {
    const total = quiz.questions.length;

    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("question");
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const questionTopRef = useRef<HTMLDivElement | null>(null);

    const totalMs = 15 * 1000;
    const [remainingMs, setRemainingMs] = useState(totalMs);

    function ensureQuestionVisible() {
        const el = questionTopRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const margin = 96;
        const viewH = window.innerHeight || 0;
        const above = rect.top < margin;
        const below = rect.top > viewH - margin;
        if (!above && !below) return;
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    useEffect(() => {
        if (phase !== "question") return;

        let raf: number | null = null;
        const started = performance.now();
        setRemainingMs(totalMs);

        const tick = (now: number) => {
            const elapsed = now - started;
            const next = Math.max(0, totalMs - elapsed);
            setRemainingMs(next);

            if (next <= 0) {
                if (phase === "question") {
                    setRemainingMs(totalMs);
                    setSelected(-1);
                    setPhase("feedback");
                }
                return;
            }

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => {
            if (raf) cancelAnimationFrame(raf);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, phase, totalMs]);

    useEffect(() => {
        if (phase !== "question") return;
        ensureQuestionVisible();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, phase]);

    const current = quiz.questions[index];

    const shuffled = useMemo(() => {
        const seedKey = `${quiz.slug}:${index}`;
        return shuffleOptions(current.options, seedKey);
    }, [current.options, index, quiz.slug]);

    const shuffledCorrectIndex = useMemo(() => {
        return shuffled.findIndex((x) => x.index === current.correctIndex);
    }, [current.correctIndex, shuffled]);

    const isCorrect = useMemo(() => {
        if (selected === null) return false;
        return selected === shuffledCorrectIndex;
    }, [selected, shuffledCorrectIndex]);

    function onSelect(idx: number) {
        if (phase !== "question") return;
        setRemainingMs(totalMs);
        setSelected(idx);
        if (idx === shuffledCorrectIndex) setScore((s) => s + 1);
        setPhase("feedback");
    }

    function next() {
        if (index + 1 >= total) {
            setPhase("result");
            return;
        }
        setRemainingMs(totalMs);
        setIndex((i) => i + 1);
        setSelected(null);
        setPhase("question");
    }

    function restart() {
        setIndex(0);
        setSelected(null);
        setScore(0);
        setPhase("question");
        setSubmitted(false);
        setRemainingMs(totalMs);
    }

    async function submitResultOnce() {
        if (submitted) return;
        setSubmitted(true);

        try {
            await fetch("/api/quiz/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    quizId: quiz.slug,
                    correct: score,
                    total,
                }),
            });
        } catch {
            // Best-effort submission.
        }
    }

    useEffect(() => {
        if (phase !== "result") return;
        void submitResultOnce();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    const earnedPoints = score * quiz.pointsPerCorrect;

    const recommended = useMemo(() => {
        const list = Array.isArray(allQuizzes) ? allQuizzes : [];
        const pool = list.filter((q) => q.slug !== quiz.slug);
        const targetCategory = (quiz.category ?? "").toLowerCase();
        const targetLeague = (quiz.league ?? "").toLowerCase();

        const byCategory = pool.filter((q) => (q.category ?? "").toLowerCase() === targetCategory);
        if (byCategory.length) return byCategory.slice(0, 4);

        const byLeague = pool.filter((q) => (q.league ?? "").toLowerCase() === targetLeague);
        if (byLeague.length) return byLeague.slice(0, 4);

        return pool.slice(0, 4);
    }, [allQuizzes, quiz.category, quiz.slug]);

    const seconds = Math.ceil(remainingMs / 1000);
    const progress = clamp(remainingMs / totalMs, 0, 1);

    const quizProgressCount = phase === "result" ? total : Math.min(index + 1, total);
    const quizProgressPct = total > 0 ? (quizProgressCount / total) * 100 : 0;

    const feedbackTone = selected !== null && selected >= 0 ? (isCorrect ? "correct" : "wrong") : "timeout";

    return (
        <div className="relative">
            <AnimatePresence>
                {phase === "feedback" ? (
                    <motion.div
                        key={`feedback-tint-${quiz.slug}-${index}-${feedbackTone}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className={
                            "pointer-events-none fixed inset-0 z-40 " +
                            (feedbackTone === "correct"
                                ? "bg-[radial-gradient(900px_circle_at_15%_15%,rgba(22,163,74,0.22),transparent_55%)]"
                                : "bg-[radial-gradient(900px_circle_at_15%_15%,rgba(239,68,68,0.22),transparent_55%)]")
                        }
                    />
                ) : null}
            </AnimatePresence>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                            <h2 className="truncate text-xl font-extrabold tracking-tight text-emerald-950">
                                {quiz.title}
                            </h2>
                            <p className="mt-1 text-sm text-emerald-950/70">
                                Question {Math.min(index + 1, total)}/{total}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-full bg-emerald-950/5 px-4 py-2 text-sm font-semibold text-emerald-950">
                                {phase === "question" ? `Time: ${seconds}s` : "Time: 15s"}
                            </div>
                            <div className="rounded-full bg-emerald-950/5 px-4 py-2 text-sm font-semibold text-emerald-950">
                                Score: {score}
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-950/10">
                        <div
                            className="h-full rounded-full bg-emerald-600 transition-[width] duration-500"
                            style={{ width: `${quizProgressPct}%` }}
                        />
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-emerald-950/10">
                        <div
                            className="h-full w-full origin-left rounded-full bg-emerald-500"
                            style={{ transform: `scaleX(${progress})` }}
                        />
                    </div>
                </CardHeader>

                <CardContent>
                    <AnimatePresence mode="wait">
                        {phase === "result" ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                                className="rounded-2xl bg-stadium-white/80 p-6"
                            >
                                <h3 className="text-2xl font-extrabold tracking-tight text-emerald-950">
                                    Results
                                </h3>
                                <p className="mt-2 text-emerald-950/75">
                                    You got <span className="font-extrabold">{score}</span> correct out of {total}.
                                </p>
                                <p className="mt-2 text-emerald-950/75">
                                    Earned points: <span className="font-extrabold">{earnedPoints}</span>
                                </p>
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                    <Button onClick={restart} variant="primary">
                                        Restart
                                    </Button>
                                    <Button as="a" href="/quiz" variant="secondary">
                                        Back to Quizzes
                                    </Button>
                                </div>

                                {recommended.length ? (
                                    <div className="mt-8">
                                        <div className="text-sm font-extrabold tracking-wide text-emerald-950">
                                            Recommended Quizzes
                                        </div>
                                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                            {recommended.map((q) => (
                                                <QuizCard
                                                    key={q.slug}
                                                    title={q.title}
                                                    subtitle={`${q.league} • ${q.difficulty} • ${q.pointsPerCorrect} pts/correct`}
                                                    href={`/quiz/${q.slug}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`${quiz.slug}-${index}-${phase}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div ref={questionTopRef} className="scroll-mt-24" />
                                <p className="text-lg font-bold leading-7 text-emerald-950">
                                    {current.question}
                                </p>

                                <div className="mt-5 grid gap-3">
                                    {shuffled.map((entry, i) => {
                                        const opt = entry.value;
                                        const active = selected === i;
                                        const show = phase === "feedback";
                                        const correct = show && i === shuffledCorrectIndex;
                                        const wrong = show && active && i !== shuffledCorrectIndex;
                                        const showCheck = show && correct;
                                        const optionTextColor = correct || wrong ? "!text-white" : "text-emerald-950";

                                        return (
                                            <button
                                                key={opt.text + i}
                                                type="button"
                                                onClick={() => onSelect(i)}
                                                className={
                                                    "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-colors duration-300 disabled:opacity-100 disabled:cursor-default " +
                                                    (phase === "question"
                                                        ? "border-emerald-950/12 bg-white hover:bg-emerald-950/[0.03]"
                                                        : "border-emerald-950/12 bg-white") +
                                                    (correct ? " !border-green-600 !bg-green-500" : "") +
                                                    (wrong ? " !border-red-600 !bg-red-500" : "")
                                                }
                                                disabled={phase !== "question"}
                                            >
                                                <span className={`min-w-0 flex-1 ${optionTextColor}`}>{opt.text}</span>
                                                {showCheck ? (
                                                    <span className="shrink-0">
                                                        <Check className="h-5 w-5" />
                                                    </span>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>

                                {phase === "feedback" && selected !== null ? (
                                    <div className="mt-5 rounded-2xl bg-stadium-white/80 p-4">
                                        <div className="text-sm font-extrabold text-emerald-950">
                                            {selected < 0 ? "Time ran out" : isCorrect ? "Correct!" : "Incorrect"}
                                        </div>
                                        <p className="mt-1 text-sm text-emerald-950/75">
                                            {selected < 0
                                                ? "Time ran out — that counts as incorrect."
                                                : shuffled[selected]?.value?.funFact}
                                        </p>
                                        <div className="mt-4">
                                            <Button onClick={next} variant="primary">
                                                {index + 1 >= total ? "View Results" : "Next Question"}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    );
}
