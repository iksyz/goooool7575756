"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type Choice = {
    id: string;
    text: string;
};

type Question = {
    id: string;
    prompt: string;
    choices: Choice[];
    correctChoiceId: string;
    explanation: string;
};

const QUESTIONS: Question[] = [
    {
        id: "q1",
        prompt: "According to the offside rule, when is a player in an offside position?",
        choices: [
            {
                id: "a",
                text: "At the moment the ball is played, the player is in the opponent’s half and one-on-one with the goalkeeper.",
            },
            {
                id: "b",
                text: "At the moment the ball is played, the player is nearer to the opponent’s goal line than both the ball and the second-last opponent.",
            },
            {
                id: "c",
                text: "At the moment the ball is played, the player is in their own half.",
            },
            {
                id: "d",
                text: "At the moment the ball is played, the player is close to the touchline.",
            },
        ],
        correctChoiceId: "b",
        explanation:
            "An offside position is judged at the moment of the pass: the player is ahead of both the ball and the second-last opponent.",
    },
    {
        id: "q2",
        prompt: "What is the primary purpose of VAR (Video Assistant Referee)?",
        choices: [
            { id: "a", text: "To approve substitutions" },
            { id: "b", text: "To decide throw-ins only" },
            {
                id: "c",
                text: "To reduce clear and obvious errors that can change the outcome of a match",
            },
            { id: "d", text: "To count corners" },
        ],
        correctChoiceId: "c",
        explanation:
            "VAR is used to review key incidents such as goals, penalties, red cards, and cases of mistaken identity to correct clear errors.",
    },
    {
        id: "q3",
        prompt: "From what distance is a penalty kick taken?",
        choices: [
            { id: "a", text: "9.15 meters" },
            { id: "b", text: "11 meters" },
            { id: "c", text: "16.5 meters" },
            { id: "d", text: "18 meters" },
        ],
        correctChoiceId: "b",
        explanation: "The penalty mark is 11 meters from the goal line.",
    },
];

type Phase = "question" | "feedback" | "result";

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

function shuffleChoices<T extends { id: string }>(choices: T[], seedKey: string) {
    const rng = mulberry32(hashSeed(seedKey));
    const arr = [...choices];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
    return arr;
}

export function InteractiveQuiz() {
    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState<Phase>("question");
    const [selected, setSelected] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    const totalMs = 15 * 1000;
    const [remainingMs, setRemainingMs] = useState(totalMs);

    const total = QUESTIONS.length;
    const current = QUESTIONS[index];

    const shuffledChoices = useMemo(() => {
        return shuffleChoices(current.choices, `interactive:${current.id}`);
    }, [current.choices, current.id]);

    const isCorrect = useMemo(() => {
        if (!current || !selected) return false;
        return selected === current.correctChoiceId;
    }, [current, selected]);

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
                    setSelected("__timeout__");
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

    function onSelect(choiceId: string) {
        if (phase !== "question") return;
        setRemainingMs(totalMs);
        setSelected(choiceId);
        const correct = choiceId === current.correctChoiceId;
        if (correct) setScore((s) => s + 1);
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
                    quizId: "interactive-quiz",
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

    const seconds = Math.ceil(remainingMs / 1000);
    const progress = clamp(remainingMs / totalMs, 0, 1);

    const quizProgressCount = phase === "result" ? total : Math.min(index + 1, total);
    const quizProgressPct = total > 0 ? (quizProgressCount / total) * 100 : 0;

    const feedbackTone = selected === "__timeout__" ? "timeout" : selected ? (isCorrect ? "correct" : "wrong") : "timeout";

    return (
        <div className="relative">
            <AnimatePresence>
                {phase === "feedback" ? (
                    <motion.div
                        key={`feedback-tint-${current.id}-${feedbackTone}`}
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
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-emerald-950">
                                Interactive Quiz
                            </h2>
                            <p className="mt-1 text-sm text-emerald-950/70">
                                Question {Math.min(index + 1, total)}/{total}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
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
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                    <Button onClick={restart} variant="primary">
                                        Restart
                                    </Button>
                                    <Button as="a" href="/" variant="secondary">
                                        Home
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={current.id + phase}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.25 }}
                            >
                                <p className="text-lg font-bold leading-7 text-emerald-950">
                                    {current.prompt}
                                </p>

                                <div className="mt-5 grid gap-3">
                                    {shuffledChoices.map((c) => {
                                        const active = selected === c.id;
                                        const show = phase === "feedback";
                                        const correct = show && c.id === current.correctChoiceId;
                                        const wrong = show && active && c.id !== current.correctChoiceId;
                                        const showCheck = show && correct;
                                        const optionTextColor = correct || wrong ? "!text-white" : "text-emerald-950";

                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => onSelect(c.id)}
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
                                                <span className={`min-w-0 flex-1 ${optionTextColor}`}>{c.text}</span>
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
                                        <div className="text-sm font-extrabold text-emerald-950">
                                            {selected === "__timeout__" ? "Time ran out" : isCorrect ? "Correct!" : "Incorrect"}
                                        </div>
                                        <p className="mt-1 text-sm text-emerald-950/75">
                                            {selected === "__timeout__"
                                                ? "Time ran out — that counts as incorrect."
                                                : current.explanation}
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
