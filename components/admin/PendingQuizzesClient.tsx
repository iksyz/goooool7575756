"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const CATEGORIES = [
    { value: "ALL", label: "All Categories", icon: "📁" },
    { value: "LEAGUES", label: "Leagues", icon: "🏆" },
    { value: "LEGENDS", label: "Legends", icon: "⭐" },
    { value: "NOSTALGIA", label: "Nostalgia", icon: "🕰️" },
    { value: "TACTICS", label: "Tactics", icon: "📋" },
    { value: "NATIONS", label: "Nations", icon: "🌍" },
    { value: "DERBIES", label: "Derbies", icon: "⚔️" },
    { value: "RECORDS", label: "Records", icon: "📈" },
    { value: "TOURNAMENTS", label: "Tournaments", icon: "🏅" },
];

type PendingQuiz = {
    id: string;
    slug: string;
    title: string;
    topic: string;
    category: string;
    difficulty: string;
    seoDescription: string;
    questions: any;
    aiGenerated: boolean;
    createdAt: string;
    creator: {
        name: string | null;
        email: string | null;
        image: string | null;
    };
};

type Props = {
    quizzes: PendingQuiz[];
};

export function PendingQuizzesClient({ quizzes: initialQuizzes }: Props) {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState(initialQuizzes);
    const [selectedQuiz, setSelectedQuiz] = useState<PendingQuiz | null>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState("ALL");

    const handleApprove = async (quizId: string) => {
        setLoading(quizId);
        setError(null);

        try {
            const res = await fetch("/api/admin/quiz-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId, action: "APPROVE" }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to approve quiz");
            }

            setQuizzes(quizzes.filter((q) => q.id !== quizId));
            setSelectedQuiz(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(null);
        }
    };

    const handleReject = async (quizId: string) => {
        const reason = prompt("Rejection reason (optional):");
        setLoading(quizId);
        setError(null);

        try {
            const res = await fetch("/api/admin/quiz-action", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quizId, action: "REJECT", reason }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to reject quiz");
            }

            setQuizzes(quizzes.filter((q) => q.id !== quizId));
            setSelectedQuiz(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(null);
        }
    };

    // Filter quizzes by category
    const filteredQuizzes =
        categoryFilter === "ALL"
            ? quizzes
            : quizzes.filter((q) => q.category === categoryFilter);

    return (
        <main className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card>
                    <CardHeader>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">
                                AI-Generated Quizzes
                            </h1>
                            <p className="mt-2 text-sm font-semibold text-emerald-950/70">
                                Review and approve AI-generated quizzes
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Category Filter */}
                        <div className="mb-6">
                            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-950">
                                <Filter className="h-4 w-4" />
                                Filter by Category
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.value}
                                        type="button"
                                        onClick={() => setCategoryFilter(cat.value)}
                                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                                            categoryFilter === cat.value
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                                                : "border border-emerald-950/10 bg-white/50 text-emerald-950 hover:bg-white/80"
                                        }`}
                                    >
                                        <span className="mr-1">{cat.icon}</span>
                                        {cat.label}
                                        {cat.value !== "ALL" && (
                                            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                                                {quizzes.filter((q) => q.category === cat.value).length}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 flex items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-900">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </div>
                        )}

                        {filteredQuizzes.length === 0 ? (
                            <div className="rounded-3xl border border-emerald-950/10 bg-white/50 p-12 text-center">
                                <p className="text-lg font-semibold text-emerald-950/70">
                                    {categoryFilter === "ALL"
                                        ? "No pending quizzes to review"
                                        : `No pending quizzes in ${CATEGORIES.find((c) => c.value === categoryFilter)?.label}`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredQuizzes.map((quiz) => (
                                    <div
                                        key={quiz.id}
                                        className="rounded-3xl border border-emerald-950/10 bg-white/70 p-6 shadow-sm"
                                    >
                                        <div className="grid gap-4 md:grid-cols-12">
                                            <div className="md:col-span-8">
                                                <div className="mb-2 flex items-center gap-2">
                                                    <h3 className="text-xl font-bold text-emerald-950">
                                                        {quiz.title}
                                                    </h3>
                                                    {quiz.aiGenerated && (
                                                        <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-bold text-white">
                                                            AI Generated
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mb-2 text-sm text-emerald-950/60">
                                                    Topic: <strong>{quiz.topic}</strong>
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-900">
                                                        {CATEGORIES.find((c) => c.value === quiz.category)?.icon}{" "}
                                                        {quiz.category}
                                                    </span>
                                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-900">
                                                        {quiz.difficulty}
                                                    </span>
                                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-900">
                                                        {JSON.parse(JSON.stringify(quiz.questions)).length || 0}{" "}
                                                        questions
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-sm text-emerald-950/70">
                                                    {quiz.seoDescription}
                                                </p>
                                                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-950/50">
                                                    <span>Created by:</span>
                                                    {quiz.creator.image && (
                                                        <img
                                                            src={quiz.creator.image}
                                                            alt=""
                                                            className="h-5 w-5 rounded-full"
                                                        />
                                                    )}
                                                    <span className="font-semibold">
                                                        {quiz.creator.name || quiz.creator.email}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {new Date(quiz.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 md:col-span-4">
                                                <Button
                                                    variant="secondary"
                                                    onClick={() => setSelectedQuiz(quiz)}
                                                    disabled={!!loading}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View Details
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleApprove(quiz.id)}
                                                    disabled={!!loading}
                                                >
                                                    {loading === quiz.id ? (
                                                        "Processing..."
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="h-4 w-4" />
                                                            Approve
                                                        </>
                                                    )}
                                                </Button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleReject(quiz.id)}
                                                    disabled={!!loading}
                                                    className="flex items-center justify-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-900 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                                                >
                                                    {loading === quiz.id ? (
                                                        "Processing..."
                                                    ) : (
                                                        <>
                                                            <XCircle className="h-4 w-4" />
                                                            Reject
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quiz Detail Modal */}
            {selectedQuiz && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedQuiz(null)}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl border border-white/40 bg-white p-8 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-extrabold text-emerald-950">
                                {selectedQuiz.title}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedQuiz(null)}
                                className="text-2xl font-bold text-emerald-950/50 hover:text-emerald-950"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-emerald-950/70">
                                    Description:
                                </p>
                                <p className="text-sm text-emerald-950">
                                    {selectedQuiz.seoDescription}
                                </p>
                            </div>

                            <div>
                                <p className="mb-3 text-lg font-bold text-emerald-950">
                                    Questions:
                                </p>
                                <div className="space-y-4">
                                    {JSON.parse(JSON.stringify(selectedQuiz.questions)).map(
                                        (q: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className="rounded-2xl border border-emerald-950/10 bg-white/50 p-4"
                                            >
                                                <p className="mb-2 font-bold text-emerald-950">
                                                    {idx + 1}. {q.question}
                                                </p>
                                                <div className="space-y-2">
                                                    {q.options.map((opt: any, oIdx: number) => (
                                                        <div
                                                            key={oIdx}
                                                            className={`rounded-xl p-3 ${
                                                                q.correctIndex === oIdx
                                                                    ? "bg-green-100"
                                                                    : "bg-gray-50"
                                                            }`}
                                                        >
                                                            <p className="text-sm font-semibold text-emerald-950">
                                                                {q.correctIndex === oIdx && "✅ "}
                                                                {opt.text}
                                                            </p>
                                                            <p className="mt-1 text-xs text-emerald-950/60">
                                                                {opt.funFact}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedQuiz(null)}
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleApprove(selectedQuiz.id)}
                                disabled={!!loading}
                            >
                                Approve
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
