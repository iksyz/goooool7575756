import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
                <div className="mx-auto max-w-2xl rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950">My Stats</h1>
                    <p className="mt-3 text-emerald-950/75">
                        Please sign in to view your profile stats.
                    </p>
                </div>
            </main>
        );
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });

    const completed = Array.isArray(user?.completedQuizzes)
        ? (user?.completedQuizzes as unknown as string[])
        : [];

    return (
        <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
            <header className="mx-auto max-w-3xl rounded-3xl border border-white/40 bg-white/70 p-6 shadow-[0_18px_60px_rgba(2,44,34,0.18)] backdrop-blur sm:p-10">
                <div className="flex items-center gap-4">
                    {session.user.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={session.user.image}
                            alt={session.user.name ?? "Profile"}
                            className="h-14 w-14 rounded-full border border-white/40 object-cover shadow-[0_10px_24px_rgba(2,44,34,0.14)]"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="h-14 w-14 rounded-full bg-emerald-950/10" />
                    )}

                    <div className="min-w-0">
                        <h1 className="truncate text-3xl font-extrabold tracking-tight text-emerald-950">
                            My Stats
                        </h1>
                        <p className="mt-1 truncate text-sm font-semibold text-emerald-950/70">
                            {session.user.name ?? session.user.email}
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-3xl border border-emerald-950/10 bg-stadium-white/80 p-5 shadow-[0_12px_26px_rgba(2,44,34,0.10)]">
                        <div className="text-xs font-semibold tracking-wide text-emerald-950/55">COMPLETED QUIZZES</div>
                        <div className="mt-2 text-3xl font-extrabold text-emerald-950">{completed.length}</div>
                    </div>
                    <div className="rounded-3xl border border-emerald-950/10 bg-stadium-white/80 p-5 shadow-[0_12px_26px_rgba(2,44,34,0.10)]">
                        <div className="text-xs font-semibold tracking-wide text-emerald-950/55">TOTAL POINTS</div>
                        <div className="mt-2 text-3xl font-extrabold text-emerald-950">{user?.totalPoints ?? 0}</div>
                    </div>
                    <div className="rounded-3xl border border-emerald-950/10 bg-stadium-white/80 p-5 shadow-[0_12px_26px_rgba(2,44,34,0.10)]">
                        <div className="text-xs font-semibold tracking-wide text-emerald-950/55">RANK</div>
                        <div className="mt-2 text-2xl font-extrabold text-emerald-950">{String(user?.level ?? "Amateur")}</div>
                    </div>
                </div>
            </header>
        </main>
    );
}
