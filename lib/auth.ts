import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";

// NEXTAUTH_URL'i kontrol et ve ayarla
const getBaseUrl = () => {
    // Cloudflare Pages için sabit URL kullan
    const cloudflareUrl = "https://goaltrivia.com";
    
    if (process.env.NEXTAUTH_URL) {
        // Tırnak işaretlerini ve sonundaki slash'leri temizle
        const cleaned = process.env.NEXTAUTH_URL
            .replace(/^["']|["']$/g, "") // Başta ve sonda tırnak işaretlerini kaldır
            .replace(/\/+$/, ""); // Sonundaki slash'leri kaldır
        
        // Eğer temizlenmiş URL goaltrivia.com ile eşleşiyorsa kullan
        if (cleaned === cloudflareUrl || cleaned.includes("goaltrivia.com")) {
            return cloudflareUrl;
        }
        return cleaned;
    }
    // Cloudflare Pages için fallback
    return cloudflareUrl;
};

// Environment variables kontrolü
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
    console.error("Missing Google OAuth credentials!");
    console.error("GOOGLE_CLIENT_ID:", googleClientId ? "SET" : "MISSING");
    console.error("GOOGLE_CLIENT_SECRET:", googleClientSecret ? "SET" : "MISSING");
}

const baseUrl = getBaseUrl();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "database",
    },
    providers: [
        GoogleProvider({
            clientId: googleClientId ?? "",
            clientSecret: googleClientSecret ?? "",
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, user }: { session: Session; user: AdapterUser }) {
            if (session.user) {
                (session.user as any).id = user.id;
            }
            return session;
        },
        async redirect({ url, baseUrl: nextAuthBaseUrl }) {
            // Cloudflare Pages için sabit baseUrl kullan
            const siteUrl = "https://goaltrivia.com";
            
            console.log("Redirect callback:", { 
                url, 
                baseUrl: nextAuthBaseUrl, 
                siteUrl,
                envNextAuthUrl: process.env.NEXTAUTH_URL 
            });
            
            // Eğer URL zaten siteUrl ile başlıyorsa, olduğu gibi döndür
            if (url.startsWith(siteUrl)) {
                return url;
            }
            
            // Relative URL ise siteUrl ile birleştir
            if (url.startsWith("/")) {
                return `${siteUrl}${url}`;
            }
            
            // Google OAuth callback URL'i ise siteUrl ile birleştir
            if (url.includes("/api/auth/callback")) {
                return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
            }
            
            // Diğer durumlarda ana sayfaya yönlendir
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
            console.error("NextAuth Error:", code, JSON.stringify(metadata, null, 2));
            // OAuthSignin hatası için detaylı log
            if (code === "OAuthSignin" || code === "SIGNIN_OAUTH_ERROR") {
                console.error("OAuthSignin Error Details:", {
                    code,
                    metadata: JSON.stringify(metadata, null, 2),
                    clientId: googleClientId?.substring(0, 20) + "...",
                    clientIdFull: googleClientId,
                    baseUrl,
                    callbackUrl: `${baseUrl}/api/auth/callback/google`,
                    nextAuthUrl: process.env.NEXTAUTH_URL,
                    checkRedirectUri: "Google Cloud Console'da redirect URI'yi kontrol edin",
                    checkGoogleConsole: `https://console.cloud.google.com/apis/credentials?project=YOUR_PROJECT_ID`,
                });
            }
        },
        warn(code) {
            console.warn("NextAuth Warning:", code);
        },
        debug(code, metadata) {
            console.log("NextAuth Debug:", code, metadata);
        },
    },
};
