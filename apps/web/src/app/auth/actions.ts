"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function requireAuth() {
  return await getCurrentUser();
}

export async function signOut() {
  const c = await cookies();

  const accessToken = c.get("accessToken")?.value;
  const refreshToken = c.get("refreshToken")?.value;

  try {
    if (accessToken && refreshToken) {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    }
  } catch {
    // ignore logout failure
  }

  c.delete("accessToken");
  c.delete("refreshToken");
  redirect("/signin");
}

export async function getCurrentUser() {
  const c = await cookies();

  let accessToken = c.get("accessToken")?.value;

  // If no access token, try refreshing
  if (!accessToken) {
    accessToken = await refreshAccessToken();
    if (!accessToken) return null;
  }

  // Try fetching user
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();
    return data.user;
  }

  // If 401, try refresh once
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) return null;

    const retry = await fetch(`${API_URL}/auth/me`, {
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

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    if (!res.ok) {
      // Refresh failed — clear everything to break any redirect loop
      c.delete("accessToken");
      c.delete("refreshToken");
      return null;
    }

    const tokens = await res.json();

    c.set("accessToken", tokens.accessToken, { path: "/" });
    c.set("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      path: "/",
    });

    return tokens.accessToken;
  } catch {
    c.delete("accessToken");
    c.delete("refreshToken");
    return null;
  }
}
