import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    // Cookie'leri kontrol et
    const cookies = request.cookies.getAll();
    const cookieNames = cookies.map(c => c.name);
    
    // Session kontrolü
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
        allCookies: cookieNames,
        sessionCookies: cookieNames.filter(name => name.includes("auth")),
        hasSession: !!session,
        sessionData: session ? {
            email: session.user?.email,
            name: session.user?.name,
        } : null,
    });
}
