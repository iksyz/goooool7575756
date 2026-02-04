import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";

// NEXTAUTH_URL'i kontrol et ve ayarla
const getBaseUrl = () => {
    if (process.env.NEXTAUTH_URL) {
        return process.env.NEXTAUTH_URL.replace(/\/+$/, "");
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    return "https://goaltrivia.com";
};

// Environment variables kontrolü
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
    console.error("Missing Google OAuth credentials!");
    console.error("GOOGLE_CLIENT_ID:", googleClientId ? "SET" : "MISSING");
    console.error("GOOGLE_CLIENT_SECRET:", googleClientSecret ? "SET" : "MISSING");
}

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "database",
    },
    providers: [
        GoogleProvider({
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
            checks: ["pkce", "state"],
        }),
    ],
    callbacks: {
        async session({ session, user }: { session: Session; user: AdapterUser }) {
            if (session.user) {
                (session.user as any).id = user.id;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // baseUrl'i manuel olarak ayarla
            const siteUrl = getBaseUrl();
            
            // Redirect döngüsünü önle
            if (url.startsWith("/")) {
                return `${siteUrl}${url}`;
            }
            
            // Aynı origin'den geliyorsa izin ver
            try {
                const urlObj = new URL(url);
                if (urlObj.origin === siteUrl) {
                    return url;
                }
            } catch {
                // URL parse edilemezse siteUrl'e yönlendir
            }
            
            return siteUrl;
        },
        async signIn({ user, account, profile }) {
            // Debug logging (production'da da çalışsın)
            console.log("SignIn callback:", {
                userEmail: user?.email,
                accountProvider: account?.provider,
                accountType: account?.type,
                hasAccount: !!account,
                hasProfile: !!profile,
            });
            // Tüm girişlere izin ver
            return true;
        },
        async jwt({ token, account, profile }) {
            // JWT callback (eğer JWT kullanılırsa)
            if (account) {
                token.accessToken = account.access_token;
            }
            return token;
        },
    },
    debug: true, // Production'da da debug açık olsun
    logger: {
        error(code, metadata) {
            console.error("NextAuth Error:", code, metadata);
        },
        warn(code) {
            console.warn("NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.log("NextAuth Debug:", code, metadata);
        },
    },
};
