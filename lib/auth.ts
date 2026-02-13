import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Session } from "next-auth";

// Environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET?.replace(/^["']|["']$/g, "") || undefined;

// Production log
if (process.env.NODE_ENV === "production") {
    console.log("🔐 Auth Config:", {
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
        hasSecret: !!nextAuthSecret,
    });
}

// Custom JWT encode/decode - SubtleCrypto kullanır, Cloudflare'de çalışır
async function customEncode({ token }: { token: any; secret: string }): Promise<string> {
    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(token));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(nextAuthSecret || ""),
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

async function customDecode({ token }: { token: string; secret: string }): Promise<any> {
    if (!token) {
        console.log("🔍 customDecode: No token provided");
        return null;
    }
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            console.log("🔍 customDecode: Invalid token format, parts:", parts.length);
            return null;
        }

        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(nextAuthSecret || ""),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );

        const signingInput = `${parts[0]}.${parts[1]}`;
        const signature = base64UrlDecode(parts[2]);
        
        const isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            signature,
            encoder.encode(signingInput)
        );

        if (!isValid) {
            console.log("🔍 customDecode: Invalid signature");
            return null;
        }

        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        console.log("✅ customDecode: Token decoded successfully", { email: payload.email, sub: payload.sub });
        return payload;
    } catch (error: any) {
        console.error("❌ customDecode error:", error.message);
        return null;
    }
}

function base64UrlEncode(str: string): string {
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): Uint8Array {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

export const authOptions: NextAuthOptions = {
    secret: nextAuthSecret,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    // Custom JWT - Cloudflare Workers'da createCipheriv yok, SubtleCrypto kullan
    jwt: {
        encode: customEncode as any,
        decode: customDecode as any,
    },
    providers: [
        GoogleProvider({
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
            allowDangerousEmailAccountLinking: true,
            checks: ["none"],
        }),
    ],
    callbacks: {
        async session({ session, token }: { session: Session; token: any }) {
            if (session.user) {
                if (token?.sub) (session.user as any).id = token.sub;
                if (token?.email) session.user.email = token.email;
                if (token?.name) session.user.name = token.name;
                if (token?.picture) session.user.image = token.picture;
            }
            return session;
        },
        async jwt({ token, account, profile, user }) {
            if (account) {
                token.accessToken = account.access_token;
                token.provider = account.provider;
            }
            if (user) {
                token.email = user.email || token.email;
                token.name = user.name || token.name;
                token.picture = user.image || token.picture;
            }
            if (profile) {
                token.email = token.email || (profile as any).email;
                token.name = token.name || (profile as any).name;
                token.picture = token.picture || (profile as any).picture;
            }
            return token;
        },
        async signIn() {
            return true;
        },
        async redirect({ url, baseUrl }) {
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (url.startsWith(baseUrl)) return url;
            return baseUrl;
        },
    },
    debug: true,
    logger: {
        error(code, metadata) {
            console.error("❌ NextAuth Error:", code, JSON.stringify(metadata, null, 2));
        },
        warn(code) {
            console.warn("⚠️ NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.log("🔍 NextAuth Debug:", code);
        },
    },
};
