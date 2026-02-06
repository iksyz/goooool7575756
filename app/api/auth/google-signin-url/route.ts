import { NextResponse } from "next/server";

// Cloudflare Pages için Node.js runtime kullan
export const runtime = 'nodejs';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const baseUrl = process.env.NEXTAUTH_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") || "https://goaltrivia.com";
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    
    if (!clientId) {
        return NextResponse.json(
            { error: "GOOGLE_CLIENT_ID is not set" },
            { status: 500 }
        );
    }
    
    const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    
    const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    return NextResponse.json({
        url: googleOAuthUrl,
        clientId: clientId.substring(0, 20) + "...",
        redirectUri,
    });
}
