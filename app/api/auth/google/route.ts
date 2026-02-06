import { NextResponse } from "next/server";

// Google OAuth'u başlat - CSRF/crypto gerektirmez
export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") || "https://goaltrivia.com";
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!clientId) {
        return NextResponse.json({ error: "GOOGLE_CLIENT_ID not set" }, { status: 500 });
    }

    // Basit state - random hex
    const state = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
        state,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    // State'i cookie'ye kaydet
    const response = NextResponse.redirect(googleAuthUrl);
    response.cookies.set("oauth_state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 600, // 10 dakika
    });

    return response;
}
