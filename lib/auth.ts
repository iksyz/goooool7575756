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

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "database",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
            // Tüm girişlere izin ver
            return true;
        },
    },
    debug: process.env.NODE_ENV === "development",
};
