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
    timeSeconds?: number;
    questions: QuizQuestion[];
};

type QuizCatalogEntry = Pick<QuizData, "slug" | "title" | "category" | "difficulty" | "pointsPerCorrect"> & {
    league?: string;
    topic?: string;
};

type Phase = "question" | "feedback" | "result";

type MatchDayQuizProps = {
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

function TimerRing({ remainingMs, totalMs }: { remainingMs: number; totalMs: number }) {
    const size = 48;
    const stroke = 5;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const progress = clamp(remainingMs / totalMs, 0, 1);
    const dashOffset = c * (1 - progress);

    const seconds = Math.ceil(remainingMs / 1000);

    return (
        <div className="relative h-12 w-12">
            <svg width={size} height={size} className="block">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="transparent"
                    stroke="rgba(5,46,22,0.14)"
                    strokeWidth={stroke}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="transparent"
                    stroke={progress > 0.35 ? "rgba(22,163,74,0.95)" : "rgba(239,68,68,0.95)"}
                    strokeWidth={stroke}
                    strokeDasharray={c}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs font-extrabold text-emerald-950">
                {seconds}
            </div>
        </div>
    );
}

function PitchProgress({ index, total }: { index: number; total: number }) {
    const pct = total <= 1 ? 0 : clamp(index / (total - 1), 0, 1);
    const left = `calc(${(pct * 100).toFixed(2)}% - 10px)`;

    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/70 p-4 shadow-[0_18px_60px_rgba(2,44,34,0.14)] backdrop-blur">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-90"
                style={{
                    background:
                        "repeating-linear-gradient(90deg, rgba(5,46,22,0.10) 0 2px, rgba(22,163,74,0.06) 2px 26px)",
                }}
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(900px circle at 10% 40%, rgba(250,204,21,0.12), transparent 58%), radial-gradient(900px circle at 90% 60%, rgba(37,99,235,0.10), transparent 60%)",
                }}
            />

            <div className="relative">
                <div className="flex items-center justify-between gap-4">
                    <div className="text-xs font-semibold tracking-wide text-emerald-950/70">
                        MATCH DAY PROGRESS
                    </div>
                    <div className="text-xs font-semibold text-emerald-950/60">
                        Q{index + 1}/{total}
                    </div>
                </div>

                <div className="mt-3 relative h-4 rounded-full bg-emerald-950/10">
                    <div
                        className="absolute left-0 top-0 h-full rounded-full bg-pitch-green/35"
                        style={{ width: `${pct * 100}%` }}
                    />
                    <div
                        className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border border-white/60 bg-stadium-white shadow-[0_12px_26px_rgba(2,44,34,0.18)]"
                        style={{ left }}
                    />
                    <div aria-hidden className="absolute right-1 top-1/2 h-8 w-4 -translate-y-1/2 rounded-sm border border-emerald-950/20 bg-white/50" />
                </div>
            </div>
        </div>
    );
}

export function MatchDayQuiz({ quiz, allQuizzes }: MatchDayQuizProps) {
    const total = quiz.questions.length;

    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("question");
    const [selected, setSelected] = useState<number | null>(null);
    const [score, setScore] = useState(0);
    const [flash, setFlash] = useState<null | "goal" | "miss">(null);
    const [submitted, setSubmitted] = useState(false);

    const questionTopRef = useRef<HTMLDivElement | null>(null);

    const totalMs = 15 * 1000;
    const [remainingMs, setRemainingMs] = useState(totalMs);
    const startRef = useRef<number | null>(null);
    const rafRef = useRef<number | null>(null);

    const current = quiz.questions[index];

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

    const pointsEarned = score * quiz.pointsPerCorrect;

    const timeProgress = clamp(remainingMs / totalMs, 0, 1);

    function stopTimer() {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        startRef.current = null;
    }

    function startTimer() {
        stopTimer();
        setRemainingMs(totalMs);
        startRef.current = performance.now();

        const tick = (now: number) => {
            const start = startRef.current;
            if (!start) return;
            const elapsed = now - start;
            const next = Math.max(0, totalMs - elapsed);
            setRemainingMs(next);

            if (next <= 0) {
                stopTimer();
                if (phase === "question") {
                    setRemainingMs(totalMs);
                    setSelected(-1);
                    setFlash("miss");
                    setPhase("feedback");
                }
                return;
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }

    useEffect(() => {
        if (phase !== "question") {
            stopTimer();
            return;
        }

        startTimer();
        return () => stopTimer();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index, phase, totalMs]);

    useEffect(() => {
        if (phase !== "question") return;
        ensureQuestionVisible();
    }, [index, phase]);

    useEffect(() => {
        if (!flash) return;
        const t = window.setTimeout(() => setFlash(null), 900);
        return () => window.clearTimeout(t);
    }, [flash]);

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

    function reveal(idx: number) {
        if (phase !== "question") return;
        stopTimer();
        setRemainingMs(totalMs);
        setSelected(idx);

        const ok = idx === shuffledCorrectIndex;
        if (ok) setScore((s) => s + 1);
        setFlash(ok ? "goal" : "miss");
        setPhase("feedback");
    }

    function next() {
        if (index + 1 >= total) {
            setPhase("result");
            return;
        }
        setIndex((i) => i + 1);
        setSelected(null);
        setPhase("question");
        setRemainingMs(totalMs);
    }

    function restart() {
        setIndex(0);
        setSelected(null);
        setScore(0);
        setPhase("question");
        setSubmitted(false);
        setRemainingMs(totalMs);
    }

    const feedbackFact = useMemo(() => {
        if (selected === null) return "";
        if (selected < 0) return "Time ran out — that counts as a miss.";
        return shuffled[selected]?.value?.funFact ?? "";
    }, [selected, shuffled]);

    const correctFact = useMemo(() => {
        return shuffled[shuffledCorrectIndex]?.value?.funFact ?? "";
    }, [shuffled, shuffledCorrectIndex]);

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

    return (
        <div className="relative">
            <AnimatePresence>
                {flash ? (
                    <motion.div
                        key={flash}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className={
                            "pointer-events-none fixed inset-0 z-50 " +
                            (flash === "goal"
                                ? "bg-[radial-gradient(900px_circle_at_15%_15%,rgba(22,163,74,0.28),transparent_55%)]"
                                : "bg-[radial-gradient(900px_circle_at_15%_15%,rgba(239,68,68,0.28),transparent_55%)]")
                        }
                    >
                        <div className="absolute right-6 top-20">
                            <div
                                className={
                                    "rounded-2xl border px-5 py-3 text-sm font-extrabold tracking-widest shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur " +
                                    (flash === "goal"
                                        ? "border-pitch-green/40 bg-white/70 text-pitch-green"
                                        : "border-red-500/40 bg-white/70 text-red-600")
                                }
                            >
                                {flash === "goal" ? "GOAL!" : "MISS!"}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-12">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between gap-4">
                            <PitchProgress index={Math.min(index, total - 1)} total={total} />
                            <div className="shrink-0 rounded-2xl border border-white/40 bg-white/70 p-3 shadow-[0_18px_60px_rgba(2,44,34,0.14)] backdrop-blur">
                                <TimerRing remainingMs={remainingMs} totalMs={totalMs} />
                            </div>
                        </div>

                        <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-950/10">
                            <div
                                className="h-full w-full origin-left rounded-full bg-emerald-500"
                                style={{ transform: `scaleX(${timeProgress})` }}
                            />
                        </div>

                        <Card className="shadow-premium">
                            <div
                                aria-hidden
                                className="absolute inset-0 opacity-90"
                                style={{
                                    background:
                                        "radial-gradient(1200px circle at 15% 15%, rgba(22,163,74,0.14), transparent 55%), radial-gradient(900px circle at 90% 35%, rgba(250,204,21,0.14), transparent 52%)",
                                }}
                            />

                            <CardHeader>
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <div className="text-xs font-semibold tracking-wide text-emerald-950/60">
                                            {quiz.league} • {quiz.category} • {quiz.difficulty}
                                        </div>
                                        <h2 className="mt-2 text-xl font-extrabold tracking-tight text-emerald-950">
                                            {quiz.title}
                                        </h2>
                                    </div>
                                    <div className="rounded-full bg-emerald-950/5 px-4 py-2 text-sm font-semibold text-emerald-950">
                                        🏆 {pointsEarned} pts
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent>
                                <AnimatePresence mode="wait">
                                    {phase === "result" ? (
                                        <motion.div
                                            key="result"
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -18 }}
                                            transition={{ duration: 0.28, ease: "easeOut" }}
                                            className="rounded-2xl bg-stadium-white/80 p-6"
                                        >
                                            <h3 className="text-2xl font-extrabold tracking-tight text-emerald-950">
                                                Full Time
                                            </h3>
                                            <p className="mt-2 text-emerald-950/75">
                                                Correct answers: <span className="font-extrabold">{score}</span> / {total}
                                            </p>
                                            <p className="mt-2 text-emerald-950/75">
                                                Points earned: <span className="font-extrabold">{pointsEarned}</span>
                                            </p>
                                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                                <Button onClick={restart} variant="primary">
                                                    Play Again
                                                </Button>
                                                <Button as="a" href={`/quiz/${quiz.slug}`} variant="secondary">
                                                    Back to Quiz
                                                </Button>
                                                <Button as="a" href="/leaderboard" variant="ghost">
                                                    View Leaderboard
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
                                            key={`${quiz.slug}-${index}`}
                                            initial={{ opacity: 0, x: 18 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -18 }}
                                            transition={{ duration: 0.28, ease: "easeOut" }}
                                        >
                                            <div ref={questionTopRef} className="scroll-mt-24" />
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <div className="text-xs font-semibold tracking-wide text-emerald-950/55">
                                                        QUESTION {index + 1}
                                                    </div>
                                                    <p className="mt-2 text-balance text-lg font-extrabold leading-7 text-emerald-950">
                                                        {current.question}
                                                    </p>
                                                </div>
                                            </div>

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
                                                            onClick={() => reveal(i)}
                                                            disabled={phase !== "question"}
                                                            className={
                                                                "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left text-sm font-semibold transition-colors duration-300 disabled:opacity-100 disabled:cursor-default " +
                                                                (phase === "question"
                                                                    ? "border-emerald-950/12 bg-white hover:bg-emerald-950/[0.03]"
                                                                    : "border-emerald-950/12 bg-white") +
                                                                (correct ? " !border-green-600 !bg-green-500" : "") +
                                                                (wrong ? " !border-red-600 !bg-red-500" : "")
                                                            }
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

                                            {phase === "feedback" ? (
                                                <div className="mt-5 rounded-2xl bg-stadium-white/80 p-4">
                                                    <div
                                                        className={
                                                            "text-sm font-extrabold " +
                                                            (isCorrect ? "text-pitch-green" : "text-red-600")
                                                        }
                                                    >
                                                        {isCorrect ? "GOAL!" : "MISS!"}
                                                    </div>
                                                    <p className="mt-1 text-sm text-emerald-950/75">{feedbackFact}</p>
                                                    {!isCorrect ? (
                                                        <p className="mt-2 text-sm text-emerald-950/70">
                                                            <span className="font-extrabold text-emerald-950">Correct insight:</span> {correctFact}
                                                        </p>
                                                    ) : null}
                                                    <div className="mt-4">
                                                        <Button onClick={next} variant="primary">
                                                            {index + 1 >= total ? "Full Time" : "Next"}
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
                </div>
            </div>
        </div>
    );
}
