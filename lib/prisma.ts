import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { neon } from "@neondatabase/serverless";

type GlobalForPrisma = {
    prisma?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as GlobalForPrisma;

// DATABASE_URL'i al ve tırnak işaretlerini temizle
const databaseUrlRaw = process.env.DATABASE_URL;
const connectionString = databaseUrlRaw?.replace(/^["']|["']$/g, "") || null;

if (!connectionString) {
    console.error("❌ DATABASE_URL is not set!");
    console.error("Please set DATABASE_URL in Cloudflare Pages environment variables.");
    throw new Error("DATABASE_URL is not set");
}

// Tırnak kontrolü
if (databaseUrlRaw && /^["']|["']$/.test(databaseUrlRaw)) {
    console.warn("⚠️ DATABASE_URL has quotes! They will be removed automatically.");
}

// Cloudflare Pages için Neon adapter kullanıyoruz (Supabase PostgreSQL ile uyumlu)
const sql = neon(connectionString);
const adapter = new PrismaNeon(sql);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
