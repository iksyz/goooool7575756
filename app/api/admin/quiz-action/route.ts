import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getPrismaClient } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const admin = await requireAdmin();

        if (!admin.ok) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { quizId, action, reason } = body;

        if (!quizId || !action) {
            return NextResponse.json(
                { error: "Missing quizId or action" },
                { status: 400 }
            );
        }

        const prisma = getPrismaClient();

        if (action === "APPROVE") {
            await prisma.userQuiz.update({
                where: { id: quizId },
                data: { status: "PUBLISHED" },
            });

            return NextResponse.json({ ok: true, message: "Quiz approved" });
        }

        if (action === "REJECT") {
            await prisma.userQuiz.update({
                where: { id: quizId },
                data: {
                    status: "REJECTED",
                    rejectionReason: reason || "Content does not meet guidelines",
                },
            });

            return NextResponse.json({ ok: true, message: "Quiz rejected" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (err) {
        console.error("admin/quiz-action error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Internal server error" },
            { status: 500 }
        );
    }
}
