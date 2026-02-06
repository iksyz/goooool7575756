import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { Session } from "next-auth";

// Environment variables
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthSecret = process.env.NEXTAUTH_SECRET?.replace(/^["']|["']$/g, "") || undefined;
const nextAuthUrl = process.env.NEXTAUTH_URL?.replace(/^["']|["']$/g, "").replace(/\/+$/, "") || "https://goaltrivia.com";

// Production log
if (process.env.NODE_ENV === "production") {
    console.log("🔐 Auth Config:", {
        hasClientId: !!googleClientId,
        hasClientSecret: !!googleClientSecret,
        hasSecret: !!nextAuthSecret,
        nextAuthUrl,
    });
}

export const authOptions: NextAuthOptions = {
    secret: nextAuthSecret,
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 gün
    },
    providers: [
        GoogleProvider({
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
            allowDangerousEmailAccountLinking: true,
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
    pages: {
        error: "/api/auth/signin", // Hata sayfası
    },
    debug: process.env.NODE_ENV !== "production",
    logger: {
        error(code, metadata) {
            console.error("❌ NextAuth Error:", code, JSON.stringify(metadata, null, 2));
        },
        warn(code) {
            console.warn("⚠️ NextAuth Warning:", code);
        },
        debug(code, metadata) {
            if (process.env.NODE_ENV !== "production") {
                console.log("🔍 NextAuth Debug:", code);
            }
        },
    },
};
