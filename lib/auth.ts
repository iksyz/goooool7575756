import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AdapterUser } from "next-auth/adapters";
import type { Session } from "next-auth";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "database",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
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
        async redirect({ url, baseUrl }) {
            // Redirect döngüsünü önle
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            if (new URL(url).origin === baseUrl) return url;
            return baseUrl;
        },
        async signIn({ user, account, profile }) {
            // OAuth hatasını önlemek için kontrol
            if (account?.provider === "google") {
                return true;
            }
            return true;
        },
    },
    debug: process.env.NODE_ENV === "development",
};
