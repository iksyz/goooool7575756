import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getUserByEmail, submitQuiz } from "@/lib/db";

function computeLevel(totalPoints: number) {
    if (totalPoints >= 15000) return "GOAT" as const;
    if (totalPoints >= 5000) return "WorldClass" as const;
    if (totalPoints >= 1000) return "Professional" as const;
    return "Amateur" as const;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const quizSlug = typeof body?.quizId === "string" ? body.quizId.trim() : "";
        const correct = typeof body?.correct === "number" ? body.correct : 0;
        const total = typeof body?.total === "number" ? body.total : 0;
        const timeSpent = typeof body?.timeSpent === "number" ? body.timeSpent : 0;

        if (!quizSlug) return Response.json({ error: "Missing quizId" }, { status: 400 });
        if (!Number.isFinite(correct) || correct < 0) return Response.json({ error: "Invalid correct" }, { status: 400 });
        if (!Number.isFinite(total) || total <= 0) return Response.json({ error: "Invalid total" }, { status: 400 });

        const pointsAwarded = Math.max(0, Math.floor(correct)) * 10;

        // Kullanıcıyı bul
        const user = await getUserByEmail(session.user.email);
        if (!user) return Response.json({ error: "User not found" }, { status: 404 });

        // Quiz submission kaydet (D1 abstraction layer)
        await submitQuiz({
            userId: user.id,
            quizSlug,
            score: correct,
            totalQuestions: total,
            timeSpent,
        });

        // Güncellenmiş kullanıcı bilgilerini al
        const updated = await getUserByEmail(session.user.email);
        if (!updated) return Response.json({ error: "Failed to get updated user" }, { status: 500 });

        return Response.json({ 
            ok: true, 
            pointsAwarded,
            totalPoints: updated.totalPoints,
            weeklyPoints: updated.weeklyPoints,
            monthlyPoints: updated.monthlyPoints,
            level: updated.level,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Quiz submit error:", message);
        return Response.json({ error: message }, { status: 500 });
    }
}
