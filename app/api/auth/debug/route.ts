import { NextResponse } from "next/server";

export async function GET() {
    // Tırnak işaretlerini temizle
    const nextAuthUrlRaw = process.env.NEXTAUTH_URL;
    const nextAuthUrl = nextAuthUrlRaw 
        ? nextAuthUrlRaw.replace(/^["']|["']$/g, "").replace(/\/+$/, "")
        : null;
    const nextAuthSecretRaw = process.env.NEXTAUTH_SECRET;
    const nextAuthSecret = nextAuthSecretRaw?.replace(/^["']|["']$/g, "") || null;
    const vercelUrl = process.env.VERCEL_URL;
    const baseUrl = nextAuthUrl || (vercelUrl ? `https://${vercelUrl}` : "https://goaltrivia.com");
    const hasClientId = Boolean(process.env.GOOGLE_CLIENT_ID);
    const hasClientSecret = Boolean(process.env.GOOGLE_CLIENT_SECRET);
    const hasNextAuthSecret = Boolean(nextAuthSecret);
    const clientIdPrefix = process.env.GOOGLE_CLIENT_ID?.substring(0, 20) || "NOT SET";
    const clientIdFull = process.env.GOOGLE_CLIENT_ID || "NOT SET";
    const clientSecretPrefix = process.env.GOOGLE_CLIENT_SECRET?.substring(0, 10) || "NOT SET";
    const databaseUrl = process.env.DATABASE_URL;
    const hasDatabaseUrl = Boolean(databaseUrl);
    const databaseUrlPrefix = databaseUrl ? databaseUrl.substring(0, 30) + "..." : "NOT SET";
    
    // Tırnak kontrolü
    const urlHasQuotes = nextAuthUrlRaw ? /^["']|["']$/.test(nextAuthUrlRaw) : false;
    const secretHasQuotes = nextAuthSecretRaw ? /^["']|["']$/.test(nextAuthSecretRaw) : false;
    
    return NextResponse.json({
        ok: true,
        nextAuthUrl: nextAuthUrl || "NOT SET",
        nextAuthUrlRaw: nextAuthUrlRaw || "NOT SET",
        urlHasQuotes,
        nextAuthSecret: nextAuthSecret ? `${nextAuthSecret.substring(0, 10)}...` : "NOT SET",
        nextAuthSecretRaw: nextAuthSecretRaw ? `${nextAuthSecretRaw.substring(0, 10)}...` : "NOT SET",
        secretHasQuotes,
        vercelUrl: vercelUrl || "NOT SET",
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
        hasDatabaseUrl,
        databaseUrlPrefix,
        critical: !hasDatabaseUrl
            ? "DATABASE_URL eksik! Bu çok önemli! NextAuth database adapter kullanıyor."
            : !hasNextAuthSecret 
            ? "NEXTAUTH_SECRET eksik! Bu çok önemli!" 
            : secretHasQuotes
            ? "NEXTAUTH_SECRET tırnak işaretleri içinde! Tırnakları kaldırın!"
            : !nextAuthUrl 
            ? "NEXTAUTH_URL eksik! Bu çok önemli!" 
            : urlHasQuotes
            ? "NEXTAUTH_URL tırnak işaretleri içinde! Tırnakları kaldırın!"
            : "Tüm environment variables ayarlı",
        troubleshooting: [
            "1. Cloudflare Pages → Settings → Environment Variables",
            "2. DATABASE_URL ayarlı olmalı (PostgreSQL connection string)",
            "3. NEXTAUTH_SECRET ve NEXTAUTH_URL'de tırnak işareti olmamalı",
            "4. Google Cloud Console'da Authorized redirect URIs kontrol edin",
            "5. OAuth consent screen'de test users ekli olmalı",
            "6. Veritabanı bağlantısını test edin",
        ],
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
}

