import { NextResponse } from "next/server";

export async function GET() {
    try {
        // NextAuth modülünü yükle
        const { authOptions } = await import("@/lib/auth");
        
        const clientId = authOptions.providers?.[0]?.options?.clientId;
        const hasSecret = !!authOptions.secret;
        const sessionStrategy = authOptions.session?.strategy;

        // Google token endpoint'ini test et
        let tokenEndpointOk = false;
        try {
            const res = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "grant_type=test",
            });
            tokenEndpointOk = res.status === 400; // 400 = endpoint reachable, just invalid request
        } catch (e: any) {
            tokenEndpointOk = false;
        }

        return NextResponse.json({
            ok: true,
            authOptions: {
                hasProviders: !!authOptions.providers?.length,
                providerType: authOptions.providers?.[0]?.type,
                providerId: authOptions.providers?.[0]?.id,
                clientIdPrefix: clientId ? clientId.substring(0, 20) + "..." : "NOT SET",
                hasSecret,
                sessionStrategy,
                checks: (authOptions.providers?.[0] as any)?.checks || "default",
            },
            googleTokenEndpoint: tokenEndpointOk ? "REACHABLE" : "UNREACHABLE",
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json({
            ok: false,
            error: error.message,
            stack: error.stack?.split("\n").slice(0, 5),
        }, { status: 500 });
    }
}
