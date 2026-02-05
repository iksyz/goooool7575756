import { NextResponse } from "next/server";

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") || "https://goaltrivia.com";
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    
    // Google OAuth URL'ini manuel olarak oluştur
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId || "")}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=code` +
        `&scope=openid%20email%20profile` +
        `&access_type=offline` +
        `&prompt=consent`;
    
    return NextResponse.json({
        ok: true,
        clientId: clientId || "NOT SET",
        baseUrl,
        redirectUri,
        googleOAuthUrl,
        instructions: "Bu URL'yi tarayıcınızda açarak Google OAuth'u test edebilirsiniz",
    }, {
        headers: {
            "Content-Type": "application/json",
        },
    });
}
