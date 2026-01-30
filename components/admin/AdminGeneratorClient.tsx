"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

type CategoryKey =
    | "Leagues"
    | "Legends"
    | "Nostalgia"
    | "Tactics"
    | "Nations"
    | "Derbies"
    | "Records"
    | "Tournaments";

type GeneratedQuiz = {
    slug: string;
    title: string;
    league: string;
    category: string;
    difficulty: string;
    seoDescription: string;
    seoContent: string;
    seoKeywords: string[];
    pointsPerCorrect: number;
    timeSeconds: number;
    questions: Array<{
        question: string;
        options: Array<{ text: string; funFact: string }>;
        correctIndex: number;
    }>;
};

type Mode = "single" | "bulk";

export function AdminGeneratorClient() {
    const [mode, setMode] = useState<Mode>("single");
    const [topic, setTopic] = useState("");
    const [bulkTopics, setBulkTopics] = useState("");
    const [category, setCategory] = useState<CategoryKey>("Leagues");
    const [difficulty, setDifficulty] = useState("Medium");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<GeneratedQuiz | null>(null);
    const [bulkResults, setBulkResults] = useState<GeneratedQuiz[]>([]);
    const [savedOk, setSavedOk] = useState(false);

    const topicsList = useMemo(() => {
        return bulkTopics
            .split("\n")
            .map((t) => t.trim())
            .filter(Boolean);
    }, [bulkTopics]);

    async function generateOne(t: string) {
        const res = await fetch("/api/generate-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                topic: t,
                mode: "full",
                category,
                difficulty,
            }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Generation failed");
        return json as GeneratedQuiz;
    }

    async function onGenerate() {
        setError(null);
        setResult(null);
        setBulkResults([]);
        setSavedOk(false);
        setLoading(true);

        try {
            if (mode === "single") {
                const t = topic.trim();
                if (!t) throw new Error("Missing topic");
                const q = await generateOne(t);
                setResult(q);
                return;
            }

            if (!topicsList.length) throw new Error("Paste topics (one per line)");

            const out: GeneratedQuiz[] = [];
            for (const t of topicsList) {
                const q = await generateOne(t);
                out.push(q);
                setBulkResults([...out]);
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setLoading(false);
        }
    }

    async function saveOne(q: GeneratedQuiz) {
        const res = await fetch("/api/admin/save-quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quiz: q }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Save failed");
        return json as { ok: true; slug: string };
    }

    async function onSave() {
        setError(null);
        setSavedOk(false);
        setSaving(true);
        try {
            if (mode === "single") {
                if (!result) throw new Error("Nothing to save");
                const saved = await saveOne(result);
                setResult({ ...result, slug: saved.slug });
                setSavedOk(true);
                return;
            }

            if (!bulkResults.length) throw new Error("Nothing to save");

            const out: GeneratedQuiz[] = [];
            for (const q of bulkResults) {
                const saved = await saveOne(q);
                out.push({ ...q, slug: saved.slug });
                setBulkResults([...out]);
            }

            setSavedOk(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
        } finally {
            setSaving(false);
        }
    }

    function onNewQuiz() {
        setError(null);
        setSavedOk(false);
        setResult(null);
        setBulkResults([]);
        setTopic("");
        setBulkTopics("");
    }

    return (
        <main className="mx-auto max-w-5xl px-6 py-10 sm:py-14">
            <Card>
                <CardHeader>
                    <div className="text-2xl font-extrabold tracking-tight text-emerald-950">
                        Admin Generator
                    </div>
                    <div className="mt-2 text-sm font-semibold text-emerald-950/70">
                        Generate 10-question football quizzes + 450+ word SEO article.
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="inline-flex rounded-full border border-emerald-950/10 bg-white/70 p-1">
                                <button
                                    type="button"
                                    className={
                                        "rounded-full px-4 py-2 text-sm font-extrabold " +
                                        (mode === "single"
                                            ? "bg-pitch-green text-stadium-white"
                                            : "text-emerald-950/80")
                                    }
                                    onClick={() => setMode("single")}
                                >
                                    Single
                                </button>
                                <button
                                    type="button"
                                    className={
                                        "rounded-full px-4 py-2 text-sm font-extrabold " +
                                        (mode === "bulk"
                                            ? "bg-pitch-green text-stadium-white"
                                            : "text-emerald-950/80")
                                    }
                                    onClick={() => setMode("bulk")}
                                >
                                    Bulk
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <select
                                    className="h-12 rounded-2xl border border-emerald-950/10 bg-white/80 px-4 text-sm font-semibold text-emerald-950"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as CategoryKey)}
                                >
                                    <option value="Leagues">Leagues</option>
                                    <option value="Legends">Legends</option>
                                    <option value="Nostalgia">Nostalgia</option>
                                    <option value="Tactics">Tactics</option>
                                    <option value="Nations">Nations</option>
                                    <option value="Derbies">Derbies</option>
                                    <option value="Records">Records</option>
                                    <option value="Tournaments">Tournaments</option>
                                </select>
                                <select
                                    className="h-12 rounded-2xl border border-emerald-950/10 bg-white/80 px-4 text-sm font-semibold text-emerald-950"
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        {mode === "single" ? (
                            <input
                                className="h-14 w-full rounded-3xl border border-emerald-950/10 bg-white/80 px-6 text-base font-semibold text-emerald-950"
                                placeholder="Topic (e.g. Real Madrid UCL comebacks)"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        ) : (
                            <textarea
                                className="min-h-[180px] w-full rounded-3xl border border-emerald-950/10 bg-white/80 px-6 py-4 text-sm font-semibold text-emerald-950"
                                placeholder="Paste topics (one per line)"
                                value={bulkTopics}
                                onChange={(e) => setBulkTopics(e.target.value)}
                            />
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                type="button"
                                variant="primary"
                                onClick={onGenerate}
                                disabled={loading || saving}
                            >
                                {loading ? "Generating..." : "Generate"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onSave}
                                disabled={saving || loading || (mode === "single" ? !result : !bulkResults.length)}
                            >
                                {saving ? "Saving..." : "Save to quizzes.json"}
                            </Button>
                            {savedOk ? (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={onNewQuiz}
                                    disabled={saving || loading}
                                >
                                    Yeni quiz ekle
                                </Button>
                            ) : null}
                        </div>

                        {error ? (
                            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-900">
                                {error}
                            </div>
                        ) : null}

                        {mode === "single" && result ? (
                            <pre className="max-h-[560px] overflow-auto rounded-3xl border border-emerald-950/10 bg-white/80 p-5 text-xs text-emerald-950">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        ) : null}

                        {mode === "bulk" && bulkResults.length ? (
                            <pre className="max-h-[560px] overflow-auto rounded-3xl border border-emerald-950/10 bg-white/80 p-5 text-xs text-emerald-950">
                                {JSON.stringify(bulkResults, null, 2)}
                            </pre>
                        ) : null}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
