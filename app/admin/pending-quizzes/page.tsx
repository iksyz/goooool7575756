import { requireAdmin } from "@/lib/admin";
import { AuthButton } from "@/components/AuthButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PendingQuizzesClient } from "@/components/admin/PendingQuizzesClient";
import { getPrismaClient } from "@/lib/prisma";

export default async function PendingQuizzesPage() {
    const session = await getServerSession(authOptions);
    const admin = await requireAdmin();

    if (!admin.ok) {
        if (!session) {
            return (
                <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                    <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                        <h1 className="mb-4 text-2xl font-extrabold text-emerald-950">
                            Sign In Required
                        </h1>
                        <p className="mb-6 text-sm font-semibold text-emerald-950/70">
                            Please sign in to access the admin panel.
                        </p>
                        <div className="mb-6 flex justify-center">
                            <AuthButton signedIn={false} />
                        </div>
                    </div>
                </main>
            );
        }

        return (
            <main className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
                <div className="rounded-3xl border border-white/40 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(2,44,34,0.12)] backdrop-blur sm:p-12">
                    <h1 className="mb-4 text-2xl font-extrabold text-emerald-950">
                        Access Denied
                    </h1>
                    <p className="mb-2 text-sm font-semibold text-emerald-950/70">
                        You need admin privileges to access this page.
                    </p>
                    {admin.email && (
                        <p className="text-xs text-emerald-950/50">
                            Logged in as: {admin.email}
                        </p>
                    )}
                </div>
            </main>
        );
    }

    // Fetch pending quizzes
    const prisma = getPrismaClient();
    const pendingQuizzes = await prisma.userQuiz.findMany({
        where: { status: "PENDING" },
        include: {
            creator: {
                select: {
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    // Serialize dates to strings for client component
    const serializedQuizzes = pendingQuizzes.map((quiz) => ({
        ...quiz,
        category: quiz.category as string,
        createdAt: quiz.createdAt.toISOString(),
    }));

    return <PendingQuizzesClient quizzes={serializedQuizzes} />;
}
