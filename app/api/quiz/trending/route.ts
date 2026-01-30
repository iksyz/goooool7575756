import { prisma } from "@/lib/prisma";

function normalizeCompletedQuizzes(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((v): v is string => typeof v === "string");
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value) as unknown;
            if (Array.isArray(parsed)) {
                return parsed.filter((v): v is string => typeof v === "string");
            }
        } catch {
            return [];
        }
    }

    return [];
}

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: { completedQuizzes: true },
        });

        const counts = new Map<string, number>();

        for (const u of users) {
            const completed = normalizeCompletedQuizzes(u.completedQuizzes);
            for (const slug of completed) {
                counts.set(slug, (counts.get(slug) ?? 0) + 1);
            }
        }

        const top = [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([slug, plays]) => ({ slug, plays }));

        return Response.json({ ok: true, top });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ ok: false, error: message, top: [] }, { status: 500 });
    }
}
