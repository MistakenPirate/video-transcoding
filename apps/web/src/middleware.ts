import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/signin", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const accessToken = request.cookies.get("accessToken")?.value;

  // Only consider authenticated if there's a valid access token
  // (not just a refresh token — that would cause redirect loops
  // when the access token expires and getCurrentUser returns null)
  if (!isPublic && !accessToken) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isPublic && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/watch/:path*", "/signin", "/signup"],
};
