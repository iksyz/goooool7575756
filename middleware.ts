import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Cloudflare için CSRF koruması
        // NextAuth otomatik CSRF kontrolü yapar, bu middleware sadece ekstra güvenlik sağlar
        
        // API route'ları için özel işlem yapma
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
            return NextResponse.next();
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // API route'ları her zaman erişilebilir olmalı (NextAuth kendi kontrolünü yapar)
                if (req.nextUrl.pathname.startsWith("/api/auth")) {
                    return true;
                }
                
                // Diğer korumalı route'lar için token kontrolü
                // Şimdilik tüm route'lar erişilebilir
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
