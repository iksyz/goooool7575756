import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client/edge";
import { Pool } from "@neondatabase/serverless";

type GlobalForPrisma = {
    prisma?: PrismaClient;
    pool?: Pool;
};

const globalForPrisma = globalThis as unknown as GlobalForPrisma;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pool = pool;
}
