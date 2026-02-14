import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getPrismaClient } from "@/lib/prisma";

type AdminCheck = {
    ok: boolean;
    email?: string;
};

export function parseAdminEmails() {
    const raw = process.env.ADMIN_EMAILS ?? "";
    return raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
    if (!email) return false;
    const admins = parseAdminEmails();
    if (!admins.length) return false;
    return admins.includes(email.toLowerCase());
}

/**
 * Check if user is admin by email (ADMIN_EMAILS) OR database role
 */
export async function requireAdmin(): Promise<AdminCheck> {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? undefined;
    
    if (!email) {
        return { ok: false };
    }

    // Method 1: Check ADMIN_EMAILS environment variable (fast)
    if (isAdminEmail(email)) {
        return { ok: true, email };
    }

    // Method 2: Check database role (fallback)
    try {
        const prisma = getPrismaClient();
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { role: true },
        });

        if (user?.role === "ADMIN") {
            return { ok: true, email };
        }
    } catch (err) {
        console.error("requireAdmin database check error:", err);
    }

    return { ok: false, email };
}
