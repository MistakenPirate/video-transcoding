import { NextRequest, NextResponse } from "next/server";

const publicPaths = ["/signin", "/signup"];
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Add 10s buffer so we refresh slightly before actual expiry
    return !payload.exp || payload.exp * 1000 < Date.now() + 10_000;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Check if access token is expired (local check, no API call)
  if (accessToken && isTokenExpired(accessToken)) {
    accessToken = undefined;
  }

  // Try refreshing if access token is gone but refresh token exists
  if (!accessToken && refreshToken) {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const tokens = await res.json();

        const response = isPublic
          ? NextResponse.redirect(new URL("/dashboard", request.url))
          : NextResponse.next();

        response.cookies.set("accessToken", tokens.accessToken, { path: "/" });
        response.cookies.set("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          path: "/",
        });
        return response;
      }
    } catch {
      // API unreachable
    }

    // Refresh failed — clear cookies
    const response = isPublic
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/signin", request.url));

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // Redirect unauthenticated users to signin
  if (!isPublic && !accessToken) {
    const response = NextResponse.redirect(new URL("/signin", request.url));
    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (isPublic && accessToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/upload/:path*", "/watch/:path*", "/signin", "/signup"],
};
