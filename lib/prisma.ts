import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";

type GlobalForPrisma = {
    prisma?: PrismaClient;
};

const globalForPrisma = globalThis as unknown as GlobalForPrisma;

// Lazy initialization function for Cloudflare Pages compatibility
function getPrismaClient(): PrismaClient {
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
    // PrismaNeon direkt connectionString ile initialize edilir
    const adapter = new PrismaNeon({ connectionString });

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
}

// Lazy initialization - Cloudflare Pages edge runtime için
export const prisma =
    globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

// Export helper function for API routes
export { getPrismaClient };
