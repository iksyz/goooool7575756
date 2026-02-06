import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID || "NOT SET";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "NOT SET";
    const nextAuthUrl = process.env.NEXTAUTH_URL || "NOT SET";
    const nextAuthSecret = process.env.NEXTAUTH_SECRET || "NOT SET";
    const databaseUrl = process.env.DATABASE_URL || "NOT SET";

    return NextResponse.json({
        ok: true,
        env: {
            GOOGLE_CLIENT_ID: clientId.length > 20 ? clientId.substring(0, 25) + "..." : clientId,
            GOOGLE_CLIENT_ID_length: clientId.length,
            GOOGLE_CLIENT_SECRET: clientSecret.length > 5 ? clientSecret.substring(0, 8) + "..." : clientSecret,
            GOOGLE_CLIENT_SECRET_length: clientSecret.length,
            NEXTAUTH_URL: nextAuthUrl,
            NEXTAUTH_URL_length: nextAuthUrl.length,
            NEXTAUTH_URL_hasQuotes: /^["']/.test(nextAuthUrl),
            NEXTAUTH_URL_hasTrailingSlash: nextAuthUrl.endsWith("/"),
            NEXTAUTH_SECRET: nextAuthSecret.length > 5 ? nextAuthSecret.substring(0, 8) + "..." : nextAuthSecret,
            NEXTAUTH_SECRET_length: nextAuthSecret.length,
            NEXTAUTH_SECRET_hasQuotes: /^["']/.test(nextAuthSecret),
            DATABASE_URL: databaseUrl.length > 20 ? databaseUrl.substring(0, 25) + "..." : databaseUrl,
            DATABASE_URL_length: databaseUrl.length,
            DATABASE_URL_startsWithSpace: databaseUrl.startsWith(" "),
            DATABASE_URL_hasQuotes: /^["']/.test(databaseUrl),
            ADMIN_EMAILS: process.env.ADMIN_EMAILS || "NOT SET",
            AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "NOT SET",
        },
        callbackUrl: `${nextAuthUrl.replace(/^["']|["']$/g, "").replace(/\/+$/, "")}/api/auth/callback/google`,
        timestamp: new Date().toISOString(),
    });
}
