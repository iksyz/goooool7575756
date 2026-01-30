import Link from "next/link";

import { getServerSession } from "next-auth";
import { Crown, Trophy } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function getOrderBy(scope: LeaderboardScope) {
    if (scope === "weekly") return [{ weeklyPoints: "desc" as const }, { createdAt: "asc" as const }];
    if (scope === "monthly") return [{ monthlyPoints: "desc" as const }, { createdAt: "asc" as const }];
    return [{ totalPoints: "desc" as const }, { createdAt: "asc" as const }];
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

    const top50 = (await prisma.user.findMany({
        orderBy: getOrderBy(scope),
        take: 50,
        select: {
            id: true,
            name: true,
            image: true,
            totalPoints: true,
            weeklyPoints: true,
            monthlyPoints: true,
            level: true,
            createdAt: true,
        },
    })) as unknown as LeaderboardUser[];

    const podium = top50.slice(0, 3);
    const rest = top50.slice(3);

    const userId = (session?.user as any)?.id as string | undefined;
    const userEmail = session?.user?.email ?? undefined;
    const me = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, image: true, totalPoints: true, weeklyPoints: true, monthlyPoints: true, level: true, createdAt: true },
        })
        : userEmail
            ? await prisma.user.findUnique({
                where: { email: userEmail },
                select: { id: true, name: true, image: true, totalPoints: true, weeklyPoints: true, monthlyPoints: true, level: true, createdAt: true },
            })
            : null;

    const meInTop50 = me ? top50.findIndex((u) => u.id === me.id) : -1;
    const showStickyMe = !!me && (meInTop50 === -1 || meInTop50 + 1 > 10);

    const myRank = me
        ? (await prisma.user.count({
            where:
                scope === "weekly"
                    ? { weeklyPoints: { gt: me.weeklyPoints } }
                    : scope === "monthly"
                        ? { monthlyPoints: { gt: me.monthlyPoints } }
                        : { totalPoints: { gt: me.totalPoints } },
        })) + 1
        : null;

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
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
                                                {u?.name ?? "Anonymous"}
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

            <section className="mt-10 overflow-hidden rounded-3xl border border-white/35 bg-white/60 shadow-[0_18px_60px_rgba(2,44,34,0.16)] backdrop-blur">
                <div className="border-b border-emerald-950/10 bg-emerald-950/[0.02] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold tracking-wide text-emerald-950/70">RANKINGS 4–50</div>
                        <div className="text-xs font-semibold text-emerald-950/60">Hover for glow</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead className="bg-emerald-950/[0.02]">
                            <tr className="text-xs font-semibold tracking-wide text-emerald-950/60">
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Player</th>
                                <th className="px-6 py-4">Level</th>
                                <th className="px-6 py-4 text-right">Total Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-emerald-950/10">
                            {rest.map((u, i) => {
                                const rank = i + 4;
                                const points = getPointsForScope(u, scope);
                                const highlight = me && u.id === me.id;

                                return (
                                    <tr
                                        key={u.id}
                                        className={
                                            "group transition-colors hover:bg-pitch-green/5" +
                                            (highlight ? " bg-pitch-green/10" : "")
                                        }
                                    >
                                        <td className="px-6 py-4 text-sm font-extrabold text-emerald-950/70">{rank}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {u.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={u.image}
                                                        alt={u.name ?? "Player"}
                                                        className="h-9 w-9 rounded-full border border-white/40 object-cover shadow-[0_10px_24px_rgba(2,44,34,0.12)]"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full bg-emerald-950/10" />
                                                )}
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-extrabold text-emerald-950">
                                                        {u.name ?? "Anonymous"}
                                                    </div>
                                                    <div className="truncate text-xs font-semibold text-emerald-950/55">
                                                        {highlight ? "You" : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-emerald-950/70">{String(u.level)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center justify-end gap-2 rounded-2xl border border-emerald-950/10 bg-stadium-white/80 px-4 py-2 shadow-[0_12px_26px_rgba(2,44,34,0.10)]">
                                                <Trophy className="h-4 w-4 text-referee-yellow" />
                                                <span className="text-sm font-extrabold text-emerald-950">{points}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {showStickyMe && me && myRank ? (
                <div className="sticky bottom-4 mt-10">
                    <div className="mx-auto max-w-6xl">
                        <div className="overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur">
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-0 opacity-80"
                                style={{
                                    background:
                                        "radial-gradient(900px circle at 15% 15%, rgba(22,163,74,0.16), transparent 55%), radial-gradient(900px circle at 85% 60%, rgba(37,99,235,0.10), transparent 60%)",
                                }}
                            />
                            <div className="relative flex items-center justify-between gap-4 px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-2xl bg-emerald-950/5 px-4 py-3">
                                        <div className="text-[10px] font-semibold tracking-wide text-emerald-950/55">YOUR RANK</div>
                                        <div className="mt-1 text-lg font-extrabold text-emerald-950">#{myRank}</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {me.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={me.image}
                                                alt={me.name ?? "Player"}
                                                className="h-10 w-10 rounded-full border border-white/40 object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-emerald-950/10" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-extrabold text-emerald-950">
                                                {me.name ?? "Player"}
                                            </div>
                                            <div className="truncate text-xs font-semibold text-emerald-950/60">
                                                {String((me as any).level)} • {getScopeLabel(scope)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0 rounded-2xl border border-emerald-950/10 bg-stadium-white/80 px-4 py-3 text-right shadow-[0_12px_26px_rgba(2,44,34,0.10)]">
                                    <div className="text-[10px] font-semibold tracking-wide text-emerald-950/55">POINTS</div>
                                    <div className="mt-1 inline-flex items-center gap-2 text-lg font-extrabold text-emerald-950">
                                        <Trophy className="h-5 w-5 text-referee-yellow" />
                                        {scope === "weekly" ? me.weeklyPoints : scope === "monthly" ? me.monthlyPoints : me.totalPoints}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </main>
    );
}
