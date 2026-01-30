import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { isAdminEmail, parseAdminEmails } from "@/lib/admin";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const email = session?.user?.email ?? null;
        const admins = parseAdminEmails();

        return Response.json({
            ok: true,
            email,
            isAdmin: isAdminEmail(email),
            adminEmailsCount: admins.length,
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return Response.json({ ok: false, error: message }, { status: 500 });
    }
}
