import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Protected routes requiring authentication
    const protectedRoutes = ["/create-quiz", "/admin", "/profile"];

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute) {
        const token = await getToken({
            req: request,
            secret: process.env.NEXTAUTH_SECRET,
        });

        // If no token (not logged in), redirect to home with error
        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/";
            url.searchParams.set("auth", "required");
            return NextResponse.redirect(url);
        }

        // Admin-only routes
        if (pathname.startsWith("/admin")) {
            const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) =>
                e.trim().toLowerCase()
            ) || [];

            const userEmail = token.email?.toLowerCase() || "";

            if (!adminEmails.includes(userEmail)) {
                const url = request.nextUrl.clone();
                url.pathname = "/";
                url.searchParams.set("auth", "admin-required");
                return NextResponse.redirect(url);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
    ],
};
