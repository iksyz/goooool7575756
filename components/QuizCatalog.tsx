"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Flame, Flag, History, Layout, Search, Swords, Trophy, TrophyIcon, Users } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { QuizCard } from "@/components/QuizCard";

type CatalogQuiz = {
    slug: string;
    title: string;
    league: string;
    category: string;
    difficulty: string;
    pointsPerCorrect: number;
    seoDescription?: string;
};

type TrendingEntry = {
    slug: string;
    plays: number;
};

type CatalogCategory =
    | "all"
    | "trending"
    | "leagues"
    | "legends"
    | "nostalgia"
    | "tactics"
    | "nations"
    | "derbies"
    | "records"
    | "tournaments";

type CategoryDef = {
    key: Exclude<CatalogCategory, "all">;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
};

const CATEGORIES: CategoryDef[] = [
    { key: "trending", label: "Trending", icon: Flame },
    { key: "leagues", label: "Leagues", icon: Trophy },
    { key: "legends", label: "Legends", icon: Users },
    { key: "nostalgia", label: "Nostalgia", icon: History },
    { key: "tactics", label: "Tactics", icon: Layout },
    { key: "nations", label: "Nations", icon: Flag },
    { key: "derbies", label: "Derbies", icon: Swords },
    { key: "records", label: "Records", icon: BarChart3 },
    { key: "tournaments", label: "Tournaments", icon: TrophyIcon },
];

const PAGE_SIZE = 8;

function normalizeText(s: string) {
    return s.toLowerCase();
}

function mapQuizToCategory(q: CatalogQuiz): Exclude<CatalogCategory, "all"> {
    const title = normalizeText(q.title);
    const league = normalizeText(q.league);
    const category = normalizeText(q.category);
    const slug = normalizeText(q.slug);

    if (category.includes("leagues") || category === "league") return "leagues";
    if (category.includes("legends")) return "legends";
    if (category.includes("nostalgia")) return "nostalgia";
    if (category.includes("tactics")) return "tactics";
    if (category.includes("nations")) return "nations";
    if (category.includes("derbies")) return "derbies";
    if (category.includes("records")) return "records";
    if (category.includes("tournaments")) return "tournaments";

    if (
        category.includes("tournament") ||
        title.includes("tournament") ||
        slug.includes("tournament") ||
        league.includes("cup") ||
        category.includes("cup") ||
        title.includes("cup") ||
        slug.includes("cup") ||
        league.includes("champions league") ||
        slug.includes("champions-league") ||
        league.includes("europa") ||
        slug.includes("europa") ||
        league.includes("conference") ||
        slug.includes("conference") ||
        league.includes("copa") ||
        slug.includes("copa")
    ) {
        return "tournaments";
    }

    if (category.includes("derby") || title.includes("derby") || slug.includes("derby") || slug.includes("clasico")) {
        return "derbies";
    }

    if (category.includes("record") || title.includes("record") || slug.includes("record") || category.includes("stats")) {
        return "records";
    }

    if (
        category.includes("nation") ||
        category.includes("international") ||
        league.includes("international") ||
        league.includes("national") ||
        league.includes("world cup") ||
        title.includes("world cup") ||
        slug.includes("world-cup")
    ) {
        return "nations";
    }

    if (category.includes("tactic") || title.includes("tactic") || slug.includes("tactic")) return "tactics";

    if (category.includes("club")) return "legends";

    if (
        title.includes("legend") ||
        category.includes("legend") ||
        category.includes("icon") ||
        title.includes("icon") ||
        slug.includes("legend")
    ) {
        return "legends";
    }

    if (
        category.includes("history") ||
        title.includes("history") ||
        slug.includes("history") ||
        title.includes("classic") ||
        slug.includes("classic")
    ) {
        return "nostalgia";
    }

    if (league.includes("league") || league.includes("uefa") || league.includes("world")) return "leagues";

    return "leagues";
}

function CategoryButton({
    category,
    active,
    onClick,
}: {
    category: CategoryDef;
    active: boolean;
    onClick: () => void;
}) {
    const Icon = category.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className={
                "group flex w-full items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition-colors " +
                (active
                    ? "border-pitch-green bg-pitch-green/10 text-emerald-950 shadow-[0_0_0_1px_rgba(22,163,74,0.12),0_18px_60px_rgba(2,44,34,0.12)]"
                    : "border-white/40 bg-white/70 text-emerald-950/80 shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur hover:bg-white/80")
            }
        >
            <Icon className={"h-4 w-4 " + (active ? "text-pitch-green" : "text-emerald-950/60 group-hover:text-pitch-green")} />
            <span>{category.label}</span>
        </button>
    );
}

function TrendingBadge({ quiz }: { quiz: CatalogQuiz }) {
    return (
        <Link
            href={`/quiz/${quiz.slug}`}
            className="inline-flex items-center rounded-full border border-white/40 bg-white/70 px-3 py-1 text-xs font-semibold text-emerald-950/80 shadow-[0_12px_30px_rgba(2,44,34,0.12)] backdrop-blur transition-colors hover:border-pitch-green/40 hover:text-pitch-green"
        >
            {quiz.title}
        </Link>
    );
}

export function QuizCatalog({
    quizzes,
    title,
    description,
    showTrending = true,
    className,
}: {
    quizzes: CatalogQuiz[];
    title?: string;
    description?: string;
    showTrending?: boolean;
    className?: string;
}) {
    const [active, setActive] = useState<CatalogCategory>("all");
    const [trending, setTrending] = useState<TrendingEntry[]>([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [searchQuery, setSearchQuery] = useState("");

    const resultsTopRef = useRef<HTMLDivElement | null>(null);
    const didMountRef = useRef(false);

    useEffect(() => {
        if (!showTrending) return;

        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/quiz/trending", { cache: "no-store" });
                const json = (await res.json()) as { top?: TrendingEntry[] };
                if (!cancelled) setTrending(Array.isArray(json.top) ? json.top : []);
            } catch {
                if (!cancelled) setTrending([]);
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, [showTrending]);

    const trendingQuizzes = useMemo(() => {
        if (!trending.length) return [];
        const bySlug = new Map(quizzes.map((q) => [q.slug, q] as const));
        return trending
            .map((t) => bySlug.get(t.slug))
            .filter((q): q is CatalogQuiz => Boolean(q));
    }, [quizzes, trending]);

    const visibleCategories = useMemo(() => {
        if (showTrending) return CATEGORIES;
        return CATEGORIES.filter((c) => c.key !== "trending");
    }, [showTrending]);

    const filtered = useMemo(() => {
        let result = quizzes;
        
        // Kategori filtresi
        if (active !== "all") {
            if (active === "trending") {
                result = showTrending ? trendingQuizzes : quizzes;
            } else {
                result = quizzes.filter((q) => mapQuizToCategory(q) === active);
            }
        }
        
        // Arama filtresi
        if (searchQuery.trim()) {
            const query = normalizeText(searchQuery.trim());
            result = result.filter((q) => {
                const title = normalizeText(q.title);
                const league = normalizeText(q.league);
                const category = normalizeText(q.category);
                const description = normalizeText(q.seoDescription || "");
                
                return (
                    title.includes(query) ||
                    league.includes(query) ||
                    category.includes(query) ||
                    description.includes(query)
                );
            });
        }
        
        return result;
    }, [active, quizzes, showTrending, trendingQuizzes, searchQuery]);

    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [active, searchQuery]);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            return;
        }

        if (typeof window === "undefined") return;
        if (window.matchMedia("(min-width: 1024px)").matches) return;

        resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [active]);

    const visible = useMemo(() => {
        return filtered.slice(0, visibleCount);
    }, [filtered, visibleCount]);

    const canLoadMore = filtered.length > visibleCount;

    const showAllButton = active !== "all";

    return (
        <section className={className}>
            {title ? (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="inline-block rounded-3xl border border-white/35 bg-white/70 px-5 py-4 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur">
                            <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-[0_16px_34px_rgba(2,44,34,0.24)]">
                                <span className="bg-gradient-to-r from-referee-yellow via-amber-300 to-stadium-white bg-clip-text text-transparent">
                                    {title}
                                </span>
                            </h2>
                            {description ? (
                                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-emerald-950/85">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {showAllButton ? (
                        <button
                            type="button"
                            onClick={() => setActive("all")}
                            className="mt-3 inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-extrabold text-emerald-950/80 shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur transition-colors hover:text-pitch-green sm:mt-0"
                        >
                            All Quizzes
                        </button>
                    ) : null}
                </div>
            ) : null}

            <div className="mt-6 grid items-start gap-6 lg:grid-cols-12">
                <aside className="lg:col-span-4 self-start">
                    <div className="space-y-4 lg:sticky lg:top-24">
                        {/* Arama Kutusu */}
                        <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur">
                            <div className="text-xs font-extrabold tracking-widest text-emerald-950/70">SEARCH QUIZZES</div>
                            <div className="relative mt-4">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-950/40" />
                                <input
                                    type="text"
                                    placeholder="Search by title, league..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-2xl border border-white/40 bg-white/90 py-3 pl-10 pr-4 text-sm font-semibold text-emerald-950 placeholder-emerald-950/40 shadow-[0_12px_30px_rgba(2,44,34,0.08)] backdrop-blur transition-all focus:border-pitch-green focus:outline-none focus:ring-2 focus:ring-pitch-green/20"
                                />
                            </div>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-2 text-xs font-semibold text-emerald-950/60 hover:text-pitch-green"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>

                        {/* Kategoriler */}
                        <div className="rounded-3xl border border-white/40 bg-white/70 p-5 shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur">
                            <div className="text-xs font-extrabold tracking-widest text-emerald-950/70">CATEGORIES</div>
                            <div className="mt-4 grid gap-3">
                                {visibleCategories.map((c) => (
                                    <CategoryButton
                                        key={c.key}
                                        category={c}
                                        active={active === c.key}
                                        onClick={() => setActive(c.key)}
                                    />
                                ))}
                            </div>

                            {showAllButton ? (
                                <button
                                    type="button"
                                    onClick={() => setActive("all")}
                                    className="mt-4 w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm font-extrabold text-emerald-950/80 shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur transition-colors hover:text-pitch-green"
                                >
                                    All Quizzes
                                </button>
                            ) : null}
                        </div>
                    </div>
                </aside>

                <div className="lg:col-span-8">
                    <div ref={resultsTopRef} className="scroll-mt-24" />
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={active}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                            className="grid gap-6 sm:grid-cols-2"
                        >
                            {visible.map((q) => (
                                <motion.div
                                    key={q.slug}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <QuizCard
                                        title={q.title}
                                        subtitle={`${q.league} • ${q.difficulty} • ${q.pointsPerCorrect} pts/correct`}
                                        href={`/quiz/${q.slug}`}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {canLoadMore ? (
                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                                className="inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/70 px-5 py-3 text-sm font-extrabold text-emerald-950/80 shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur transition-colors hover:text-pitch-green"
                            >
                                Load more
                            </button>
                        </div>
                    ) : null}

                    {!filtered.length ? (
                        <div className="mt-6 rounded-3xl border border-white/40 bg-white/70 p-6 text-center shadow-[0_18px_60px_rgba(2,44,34,0.10)] backdrop-blur">
                            <p className="text-sm font-semibold text-emerald-950/70">
                                {searchQuery 
                                    ? `No quizzes found for "${searchQuery}"`
                                    : "No quizzes found in this category."}
                            </p>
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-3 inline-flex items-center justify-center rounded-2xl border border-white/40 bg-white/70 px-4 py-2 text-sm font-extrabold text-emerald-950/80 transition-colors hover:text-pitch-green"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
