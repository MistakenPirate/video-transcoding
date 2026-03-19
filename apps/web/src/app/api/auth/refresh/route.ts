import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const c = await cookies();
  const refreshToken = c.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    c.delete("accessToken");
    c.delete("refreshToken");
    return NextResponse.json({ error: "Refresh failed" }, { status: 401 });
  }

  const tokens = await res.json();

  c.set("accessToken", tokens.accessToken, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  c.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ success: true });
}
