import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Cloudflare Pages için Node.js runtime kullan (Prisma için gerekli)
export const runtime = 'nodejs';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
