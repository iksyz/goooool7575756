"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Wand2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

const CATEGORIES = [
    { value: "LEAGUES", label: "Leagues", icon: "🏆" },
    { value: "LEGENDS", label: "Legends", icon: "⭐" },
    { value: "NOSTALGIA", label: "Nostalgia", icon: "🕰️" },
    { value: "TACTICS", label: "Tactics", icon: "📋" },
    { value: "NATIONS", label: "Nations", icon: "🌍" },
    { value: "DERBIES", label: "Derbies", icon: "⚔️" },
    { value: "RECORDS", label: "Records", icon: "📈" },
    { value: "TOURNAMENTS", label: "Tournaments", icon: "🏅" },
];

export default function CreateQuizAI Page() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [topic, setTopic] = useState("");
    const [category, setCategory] = useState("LEAGUES");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!session) {
            setError("Please sign in to create a quiz.");
            return;
        }

        if (!topic.trim()) {
            setError("Please enter a topic.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/ai-generate-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ topic: topic.trim(), category }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate quiz.");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-950" />
            </div>
        );
    }

    if (!session) {
        return (
            <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-extrabold text-emerald-950">
                            Sign In Required
                        </h1>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-emerald-950/70">
                            Please sign in to create AI-powered quizzes.
                        </p>
                    </CardContent>
                </Card>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-6 py-10 sm:py-14">
            {/* Animated Background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-20 -top-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl" />
                <div className="absolute -bottom-20 -right-20 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-pink-400/20 to-yellow-400/20 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative mx-auto max-w-4xl"
            >
                <Card className="border-white/60 bg-white/80 shadow-2xl backdrop-blur-xl">
                    <CardHeader>
                        <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 shadow-lg">
                                <Wand2 className="h-10 w-10 text-white" />
                            </div>
                            <div className="flex-1">
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent"
                                >
                                    AI Quiz Generator
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-3 text-base font-semibold text-emerald-950/70"
                                >
                                    Enter a football topic, choose a category, and let AI generate a
                                    complete quiz with 5 questions for you. Our AI creates
                                    technically accurate, challenging, and fun quizzes instantly.
                                </motion.p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Topic Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="mb-3 block text-lg font-bold text-emerald-950">
                                    <Sparkles className="mb-1 inline h-5 w-5 text-yellow-500" />{" "}
                                    Quiz Topic
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., '2005 Champions League Final' or 'Arda Güler Career'"
                                    className="w-full rounded-2xl border-2 border-purple-200 bg-white/90 px-6 py-4 text-lg font-semibold text-emerald-950 shadow-inner transition-all placeholder:text-emerald-950/40 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-200/50"
                                />
                                <p className="mt-2 text-xs text-emerald-950/50">
                                    💡 Tip: Be specific! "Messi's 2012 Season" works better than
                                    just "Messi"
                                </p>
                            </motion.div>

                            {/* Category Selection */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="mb-3 block text-lg font-bold text-emerald-950">
                                    📁 Category
                                </label>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            type="button"
                                            onClick={() => setCategory(cat.value)}
                                            className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all ${
                                                category === cat.value
                                                    ? "border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg"
                                                    : "border-purple-200 bg-white/50 hover:border-purple-300 hover:bg-white/80"
                                            }`}
                                        >
                                            <div className="relative z-10 flex items-center gap-3">
                                                <span className="text-3xl">{cat.icon}</span>
                                                <div>
                                                    <p
                                                        className={`text-sm font-bold ${
                                                            category === cat.value
                                                                ? "text-white"
                                                                : "text-emerald-950"
                                                        }`}
                                                    >
                                                        {cat.label}
                                                    </p>
                                                </div>
                                            </div>
                                            {category === cat.value && (
                                                <motion.div
                                                    layoutId="active-category"
                                                    className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500 to-pink-500"
                                                    transition={{
                                                        type: "spring",
                                                        bounce: 0.2,
                                                        duration: 0.6,
                                                    }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* How It Works */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6"
                            >
                                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-950">
                                    <Wand2 className="h-4 w-4 text-purple-500" />
                                    How It Works
                                </h3>
                                <ol className="space-y-2 text-sm text-emerald-950/70">
                                    <li>
                                        <strong className="text-emerald-950">1. AI Analysis:</strong>{" "}
                                        Our AI analyzes your topic and category
                                    </li>
                                    <li>
                                        <strong className="text-emerald-950">
                                            2. Question Generation:
                                        </strong>{" "}
                                        Creates 5 technically accurate questions
                                    </li>
                                    <li>
                                        <strong className="text-emerald-950">3. Admin Review:</strong>{" "}
                                        Quiz enters pending queue for approval
                                    </li>
                                    <li>
                                        <strong className="text-emerald-950">4. Published:</strong>{" "}
                                        Once approved, appears on the site
                                    </li>
                                </ol>
                            </motion.div>

                            {/* Error/Success */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-900"
                                >
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    {error}
                                </motion.div>
                            )}

                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-3 rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-5 py-4 text-sm font-semibold text-green-900"
                                >
                                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                                    ✨ Quiz generated successfully! Redirecting...
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => router.push("/")}
                                    disabled={loading || success}
                                >
                                    Cancel
                                </Button>
                                <button
                                    type="submit"
                                    disabled={loading || success}
                                    className="group relative overflow-hidden rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Generating with AI...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Wand2 className="h-5 w-5" />
                                            Generate Quiz
                                        </span>
                                    )}
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-6 text-center text-xs text-emerald-950/50"
                >
                    Powered by AI • All quizzes are reviewed by admins before publishing
                </motion.p>
            </motion.div>
        </main>
    );
}
