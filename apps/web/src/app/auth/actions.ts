"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin");
  }
  return user;
}

export async function signOut() {
  const c = await cookies();

  const accessToken = c.get("accessToken")?.value;
  const refreshToken = c.get("refreshToken")?.value;

  if (accessToken) {
    await fetch(`http://localhost:8000/auth/logout`, {
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
  const accessToken = c.get("accessToken")?.value;

  if (!accessToken) return null;

  const res = await fetch(`http://localhost:8000/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (res.ok) {
    const data = await res.json();
    return data.user;
  }

  // If access token expired try refresh
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();

    if (!refreshed) return null;

    return getCurrentUser();
  }

  return null;
}

async function refreshAccessToken() {
  const c = await cookies();
  const refreshToken = c.get("refreshToken")?.value;

  if (!refreshToken) return false;

  const res = await fetch(`http://localhost:8000/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) return false;

  const tokens = await res.json();

  c.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    path: "/",
  });

  c.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    path: "/",
  });

  return true;
}
