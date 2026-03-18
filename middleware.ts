import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const isAuthenticated =
        request.cookies.get("auth-token")?.value === "authenticated";
    const { pathname } = request.nextUrl;

    if (isAuthenticated && pathname === "/login") {
        return NextResponse.redirect(new URL("/admin/data", request.url));
    }

    if (!isAuthenticated && pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/login"],
};