import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Cloudflare Pages için Node.js runtime kullan
export const runtime = 'nodejs';

export async function GET() {
    try {
        // Session kontrolü
        const session = await getServerSession(authOptions);
        
        // Veritabanı bağlantısını test et
        let dbTest = { ok: false, error: null };
        try {
            const { prisma } = await import("@/lib/prisma");
            await prisma.$connect();
            const result = await prisma.$queryRaw`SELECT 1 as test`;
            await prisma.$disconnect();
            dbTest = { ok: true, error: null };
        } catch (error: any) {
            dbTest = { ok: false, error: error.message };
        }

        // Adapter kontrolü
        const hasAdapter = !!authOptions.adapter;

        return NextResponse.json({
            ok: true,
            session: session ? {
                user: {
                    email: session.user?.email,
                    name: session.user?.name,
                },
            } : null,
            database: {
                connected: dbTest.ok,
                error: dbTest.error,
            },
            adapter: {
                hasAdapter,
                type: hasAdapter ? "PrismaAdapter" : "None (JWT mode)",
            },
            authConfig: {
                hasClientId: !!process.env.GOOGLE_CLIENT_ID,
                hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
                hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
                hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
                hasDatabaseUrl: !!process.env.DATABASE_URL,
            },
        });
    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message || "Unknown error",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        }, { status: 500 });
    }
}
