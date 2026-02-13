import { NextRequest, NextResponse } from "next/server";
import { encode } from "next-auth/jwt";
import { upsertUser } from "@/lib/db";

// Google OAuth callback handler
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXTAUTH_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") || "https://goaltrivia.com";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const nextAuthSecret = process.env.NEXTAUTH_SECRET?.replace(/^["']|["']$/g, "") || "";
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    // Hata kontrolü
    if (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(`${baseUrl}?error=${error}`);
    }

    if (!code) {
        console.error("No authorization code received");
        return NextResponse.redirect(`${baseUrl}?error=no_code`);
    }

    // State kontrolü
    const savedState = request.cookies.get("oauth_state")?.value;
    if (!savedState || savedState !== state) {
        console.error("State mismatch:", { savedState, state });
        return NextResponse.redirect(`${baseUrl}?error=state_mismatch`);
    }

    try {
        // Authorization code'u token'a çevir
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: clientId || "",
                client_secret: clientSecret || "",
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || tokenData.error) {
            console.error("Token exchange failed:", tokenData);
            return NextResponse.redirect(`${baseUrl}?error=token_exchange_failed`);
        }

        // Google'dan kullanıcı bilgilerini al
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userInfo = await userInfoResponse.json();

        if (!userInfoResponse.ok) {
            console.error("User info fetch failed:", userInfo);
            return NextResponse.redirect(`${baseUrl}?error=user_info_failed`);
        }

        console.log("✅ Google OAuth successful:", {
            email: userInfo.email,
            name: userInfo.name,
        });

        // Kullanıcıyı D1'e kaydet veya güncelle
        await upsertUser({
            email: userInfo.email,
            name: userInfo.name,
            image: userInfo.picture,
        });

        // JWT session token oluştur - NextAuth formatında
        const sessionToken = await createSessionToken({
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
            sub: userInfo.id,
        }, nextAuthSecret);

        // Admin kontrolü - admin ise /admin/generator, değilse ana sayfa
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
            .split(",")
            .map(s => s.trim().toLowerCase())
            .filter(Boolean);
        const isAdmin = adminEmails.includes(userInfo.email.toLowerCase());
        const redirectUrl = isAdmin ? `${baseUrl}/admin/generator` : baseUrl;

        // Session cookie'yi ayarla ve yönlendir
        const response = NextResponse.redirect(redirectUrl);
        
        // Production için __Secure prefix (HTTPS)
        const isSecure = baseUrl.startsWith("https://");
        const cookieName = isSecure 
            ? "__Secure-next-auth.session-token"
            : "next-auth.session-token";
        
        response.cookies.set(cookieName, sessionToken, {
            httpOnly: true,
            secure: isSecure,
            sameSite: "lax",
            path: "/",
            maxAge: 30 * 24 * 60 * 60, // 30 gün
        });

        // State cookie'yi temizle
        response.cookies.delete("oauth_state");

        return response;
    } catch (error: any) {
        console.error("OAuth callback error:", error);
        return NextResponse.redirect(`${baseUrl}?error=callback_error&message=${encodeURIComponent(error.message || "Unknown error")}`);
    }
}

// SubtleCrypto ile JWT oluştur - lib/auth.ts customDecode ile uyumlu
async function createSessionToken(
    payload: { email: string; name: string; picture: string; sub: string },
    secret: string
): Promise<string> {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    
    // NextAuth beklediği exact payload yapısı
    const tokenPayload = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub,
        iat: now,
        exp: now + 30 * 24 * 60 * 60, // 30 gün
        jti: crypto.randomUUID(),
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // HMAC-SHA256 ile imzala - lib/auth.ts ile aynı method
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
    const encodedSignature = base64UrlEncode(
        String.fromCharCode(...new Uint8Array(signature))
    );

    return `${signingInput}.${encodedSignature}`;
}

function base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
