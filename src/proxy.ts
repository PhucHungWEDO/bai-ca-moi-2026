import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const authCookie = request.cookies.get("auth-token");
  
  // Define public paths that don't need authentication
  const isAuthPath = request.nextUrl.pathname.startsWith("/login");
  
  // If no auth token and trying to access protected route
  if (!authCookie?.value && !isAuthPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // If has auth token and trying to access login page
  if (authCookie?.value && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icons (PWA icons)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)",
  ],
};
