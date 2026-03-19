"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    // Clear stale cookies before redirecting
    const c = await cookies();
    c.delete("accessToken");
    c.delete("refreshToken");
    redirect("/signin");
  }
  return user;
}

export async function signOut() {
  const c = await cookies();

  const accessToken = c.get("accessToken")?.value;
  const refreshToken = c.get("refreshToken")?.value;

  if (accessToken) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
  }

  c.delete("accessToken");
  c.delete("refreshToken");

  redirect("/signin");
}

export async function getCurrentUser() {
  const c = await cookies();
  let accessToken = c.get("accessToken")?.value;

  if (!accessToken) {
    // Try refreshing
    accessToken = await refreshAccessToken();
    if (!accessToken) return null;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();
    return data.user;
  }

  // Access token expired — try refresh
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return null;

    const retry = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${newToken}` },
      cache: "no-store",
    });

    if (retry.ok) {
      const data = await retry.json();
      return data.user;
    }
  }

  return null;
}

async function refreshAccessToken(): Promise<string | null> {
  const c = await cookies();
  const refreshToken = c.get("refreshToken")?.value;

  if (!refreshToken) return null;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return null;

  const tokens = await res.json();

  c.set("accessToken", tokens.accessToken, {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    path: "/",
  });

  if (tokens.refreshToken) {
    c.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
  }

  return tokens.accessToken;
}
