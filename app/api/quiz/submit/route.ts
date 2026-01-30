import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function computeLevel(totalPoints: number) {
    if (totalPoints >= 15000) return "GOAT" as const;
    if (totalPoints >= 5000) return "WorldClass" as const;
    if (totalPoints >= 1000) return "Professional" as const;
    return "Amateur" as const;
}

function getWeekKey(date: Date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getMonthKey(date: Date) {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const quizId = typeof body?.quizId === "string" ? body.quizId.trim() : "";
        const correct = typeof body?.correct === "number" ? body.correct : 0;
        const total = typeof body?.total === "number" ? body.total : 0;

        if (!quizId) return Response.json({ error: "Missing quizId" }, { status: 400 });
        if (!Number.isFinite(correct) || correct < 0) return Response.json({ error: "Invalid correct" }, { status: 400 });
        if (!Number.isFinite(total) || total <= 0) return Response.json({ error: "Invalid total" }, { status: 400 });

        const pointsAwarded = Math.max(0, Math.floor(correct)) * 10;

        const existing = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!existing) return Response.json({ error: "User not found" }, { status: 404 });

        const prevCompleted = Array.isArray(existing.completedQuizzes)
            ? (existing.completedQuizzes as unknown as string[])
            : [];

        const nextCompleted = prevCompleted.includes(quizId)
            ? prevCompleted
            : [...prevCompleted, quizId];

        const now = new Date();
        const currentWeekKey = getWeekKey(now);
        const currentMonthKey = getMonthKey(now);

        const nextTotal = existing.totalPoints + pointsAwarded;
        const nextLevel = computeLevel(nextTotal);

        const prevWeeklyKey = typeof (existing as any).weeklyKey === "string" ? (existing as any).weeklyKey : "";
        const prevMonthlyKey = typeof (existing as any).monthlyKey === "string" ? (existing as any).monthlyKey : "";

        const baseWeekly = prevWeeklyKey === currentWeekKey ? ((existing as any).weeklyPoints ?? 0) : 0;
        const baseMonthly = prevMonthlyKey === currentMonthKey ? ((existing as any).monthlyPoints ?? 0) : 0;

        const nextWeekly = baseWeekly + pointsAwarded;
        const nextMonthly = baseMonthly + pointsAwarded;

        const updated = await prisma.user.update({
            where: { id: existing.id },
            data: {
                totalPoints: nextTotal,
                weeklyPoints: nextWeekly,
                weeklyKey: currentWeekKey,
                monthlyPoints: nextMonthly,
                monthlyKey: currentMonthKey,
                level: nextLevel,
                completedQuizzes: nextCompleted as any,
            },
            select: {
                totalPoints: true,
                weeklyPoints: true,
                monthlyPoints: true,
                level: true,
            },
        });

        return Response.json({ ok: true, pointsAwarded, ...updated });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ error: message }, { status: 500 });
    }
}
