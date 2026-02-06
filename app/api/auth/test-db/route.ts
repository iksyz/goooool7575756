import { NextResponse } from "next/server";

export async function GET() {
    try {
        // DATABASE_URL kontrolü
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json({
                ok: false,
                error: "DATABASE_URL is not set",
                message: "Cloudflare Pages'de DATABASE_URL environment variable'ını ayarlayın.",
            }, { status: 500 });
        }

        // Prisma'yı import et ve bağlantıyı test et
        const { prisma } = await import("@/lib/prisma");
        
        // Basit bir sorgu ile bağlantıyı test et
        await prisma.$connect();
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        await prisma.$disconnect();

        return NextResponse.json({
            ok: true,
            message: "Veritabanı bağlantısı başarılı!",
            databaseUrlPrefix: databaseUrl.substring(0, 30) + "...",
            testQuery: result,
        });
    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message || "Unknown error",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
            message: "Veritabanı bağlantısı başarısız! DATABASE_URL'i kontrol edin.",
        }, { status: 500 });
    }
}

