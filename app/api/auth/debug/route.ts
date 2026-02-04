import { NextResponse } from "next/server";

export async function GET() {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "https://goaltrivia.com";
    const hasClientId = Boolean(process.env.GOOGLE_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
    const clientIdPrefix = process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || "NOT SET";
    
    return NextResponse.json({
        ok: true,
        baseUrl,
        hasClientId,
        hasClientSecret,
        clientIdPrefix: `${clientIdPrefix}...`,
        callbackUrl: `${baseUrl}/api/auth/callback/google`,
        signInUrl: `${baseUrl}/api/auth/signin`,
        nodeEnv: process.env.NODE_ENV,
    });
}
