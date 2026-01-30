import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

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

export async function requireAdmin(): Promise<AdminCheck> {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? undefined;
    if (!email) return { ok: false };
    if (!isAdminEmail(email)) return { ok: false, email };
    return { ok: true, email };
}
