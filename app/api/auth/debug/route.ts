import { NextResponse } from "next/server";

export async function GET() {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "https://goaltrivia.com";
    const hasClientId = Boolean(process.env.GOOGLE_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
    const hasNextAuthSecret = Boolean(process.env.NEXTAUTH_SECRET);
    const clientIdPrefix = process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || "NOT SET";
    const clientIdFull = process.env.GOOGLE_CLIENT_ID || "NOT SET";
    const clientSecretPrefix = process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) || "NOT SET";
    
    return NextResponse.json({
        ok: true,
        baseUrl,
        hasClientId,
        hasClientSecret,
        hasNextAuthSecret,
        clientIdPrefix: `${clientIdPrefix}...`,
        clientIdFull: clientIdFull,
        clientSecretPrefix: `${clientSecretPrefix}...`,
        callbackUrl: `${baseUrl}/api/auth/callback/google`,
        signInUrl: `${baseUrl}/api/auth/signin`,
        nodeEnv: process.env.NODE_ENV,
        expectedCallbackUrl: "https://goaltrivia.com/api/auth/callback/google",
        checkGoogleConsole: "Google Cloud Console'da bu URL'in 'Authorized redirect URIs' listesinde olduğundan emin olun",
        critical: !hasNextAuthSecret ? "NEXTAUTH_SECRET eksik! Bu çok önemli!" : "Tüm environment variables ayarlı",
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
