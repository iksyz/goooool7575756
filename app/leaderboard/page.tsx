import Link from "next/link";

import { getServerSession } from "next-auth";
import { Crown, Trophy } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { getLeaderboard, getUserByEmail } from "@/lib/db";

type LeaderboardScope = "all" | "weekly" | "monthly";

type LeaderboardUser = {
    id: string;
    name: string | null;
    image: string | null;
    totalPoints: number;
    weeklyPoints: number;
    monthlyPoints: number;
    level: string;
};

type PageProps = {
    searchParams?: Promise<{ scope?: string }>;
};

function getScopeLabel(scope: LeaderboardScope) {
    if (scope === "weekly") return "Weekly";
    if (scope === "monthly") return "Monthly";
    return "All Time";
}

function getPointsForScope(u: LeaderboardUser, scope: LeaderboardScope) {
    if (scope === "weekly") return u.weeklyPoints;
    if (scope === "monthly") return u.monthlyPoints;
    return u.totalPoints;
}

function medalStyles(rank: 1 | 2 | 3) {
    if (rank === 1) {
        return {
            ring: "border-[color:rgba(250,204,21,0.55)]",
            badge: "bg-[color:rgba(250,204,21,0.22)] text-[color:rgba(250,204,21,0.95)]",
            glow: "shadow-[0_18px_60px_rgba(250,204,21,0.18)]",
            icon: "text-[color:rgba(250,204,21,0.95)]",
        };
    }
    if (rank === 2) {
        return {
            ring: "border-[color:rgba(148,163,184,0.55)]",
            badge: "bg-[color:rgba(148,163,184,0.22)] text-[color:rgba(148,163,184,0.95)]",
            glow: "shadow-[0_18px_60px_rgba(148,163,184,0.12)]",
            icon: "text-[color:rgba(148,163,184,0.95)]",
        };
    }
    return {
        ring: "border-[color:rgba(202,138,4,0.55)]",
        badge: "bg-[color:rgba(202,138,4,0.20)] text-[color:rgba(202,138,4,0.95)]",
        glow: "shadow-[0_18px_60px_rgba(202,138,4,0.12)]",
        icon: "text-[color:rgba(202,138,4,0.95)]",
    };
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
    const session = await getServerSession(authOptions);
    const scopeParam = (await searchParams)?.scope;
    const scope: LeaderboardScope = scopeParam === "weekly" || scopeParam === "monthly" ? scopeParam : "all";

    // D1 abstraction layer kullan
    const top50 = await getLeaderboard(scope);
    const podium = top50.slice(0, 3);
    const rest = top50.slice(3);
    
    const userEmail = session?.user?.email;
    const me = userEmail ? await getUserByEmail(userEmail) : null;
    const meInTop50 = me ? top50.findIndex((u) => u.id === me.id) : -1;
    const showStickyMe = !!me && (meInTop50 === -1 || meInTop50 + 1 > 10);
    
    // Rank hesaplama (D1'de COUNT query gerekir, şimdilik basit hesap)
    const myRank = me && meInTop50 !== -1 ? meInTop50 + 1 : null;

    return (
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <header className="mx-auto max-w-3xl rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-8">
                <h1 className="text-balance text-4xl font-extrabold tracking-tight text-emerald-950 drop-shadow-[0_10px_24px_rgba(2,44,34,0.14)] sm:text-5xl">
                    Leaderboard
                </h1>
                <p className="mt-4 text-base leading-8 text-emerald-950/80">
                    A premium stadium scoreboard for football minds. Pick a scope, earn points, and climb the ranks.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    {([
                        { scope: "all" as const, label: "All Time" },
                        { scope: "weekly" as const, label: "Weekly" },
                        { scope: "monthly" as const, label: "Monthly" },
                    ] as const).map((b) => {
                        const active = scope === b.scope;

                        return (
                            <Link
                                key={b.scope}
                                href={`/leaderboard?scope=${b.scope}`}
                                className={
                                    "relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors " +
                                    (active
                                        ? "border-pitch-green bg-pitch-green/10 text-emerald-950"
                                        : "border-emerald-950/10 bg-white/70 text-emerald-950/75 hover:bg-emerald-950/[0.03]")
                                }
                            >
                                {b.label}
                            </Link>
                        );
                    })}

                    <div className="ml-auto hidden sm:flex items-center gap-2 rounded-full bg-emerald-950/5 px-4 py-2 text-xs font-semibold text-emerald-950/70">
                        <span className="h-2 w-2 rounded-full bg-pitch-green" />
                        Showing: {getScopeLabel(scope)}
                    </div>
                </div>

                <div className="mt-6 rounded-2xl border border-referee-yellow/20 bg-referee-yellow/10 px-4 py-3">
                    <p className="text-xs font-semibold text-emerald-950/70">
                        🏆 Leaderboard ready for D1. Run setup to enable (see D1_SETUP.md)
                    </p>
                </div>
            </header>

            <section className="mt-10">
                <div className="grid gap-6 md:grid-cols-3">
                    {[2, 1, 3].map((rank) => {
                        const idx = rank - 1;
                        const u = podium[idx];
                        const styles = medalStyles(rank as 1 | 2 | 3);

                        const isFirst = rank === 1;
                        const cardSize = isFirst ? "md:order-2" : rank === 2 ? "md:order-1" : "md:order-3";
                        const avatarSize = isFirst ? "h-20 w-20" : "h-14 w-14";

                        return (
                            <div
                                key={rank}
                                className={
                                    "relative overflow-hidden rounded-3xl border bg-white/70 p-6 backdrop-blur " +
                                    styles.ring +
                                    " " +
                                    styles.glow +
                                    " " +
                                    cardSize
                                }
                            >
                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 opacity-90"
                                    style={{
                                        background:
                                            "radial-gradient(900px circle at 15% 15%, rgba(22,163,74,0.14), transparent 55%), radial-gradient(900px circle at 85% 40%, rgba(250,204,21,0.12), transparent 58%)",
                                    }}
                                />

                                <div className="relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className={"inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold " + styles.badge}>
                                            #{rank}
                                            {rank === 1 ? <Crown className={"h-4 w-4 " + styles.icon} /> : null}
                                            {rank !== 1 ? <Trophy className={"h-4 w-4 " + styles.icon} /> : null}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-semibold tracking-wide text-emerald-950/55">
                                                {getScopeLabel(scope).toUpperCase()}
                                            </div>
                                            <div className="mt-1 text-xl font-extrabold text-emerald-950">
                                                {u ? getPointsForScope(u, scope) : "—"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-4">
                                        {u?.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={u.image}
                                                alt={u.name ?? "Player"}
                                                className={
                                                    avatarSize +
                                                    " rounded-full border border-white/40 object-cover shadow-[0_12px_30px_rgba(2,44,34,0.14)]"
                                                }
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className={avatarSize + " rounded-full bg-emerald-950/10"} />
                                        )}

                                        <div className="min-w-0">
                                            <div className="truncate text-lg font-extrabold tracking-tight text-emerald-950">
                                                {u?.name ?? "—"}
                                            </div>
                                            <div className="mt-1 truncate text-sm font-semibold text-emerald-950/60">
                                                {u ? String(u.level) : ""}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-emerald-950/10">
                                        <div
                                            className="h-full rounded-full bg-pitch-green"
                                            style={{ width: `${rank === 1 ? 100 : rank === 2 ? 72 : 56}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
