import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/signin", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const hasAuth = accessToken || refreshToken;

  // Redirect unauthenticated users to signin
  if (!isPublic && !hasAuth) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (isPublic && hasAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/watch/:path*", "/signin", "/signup"],
};
