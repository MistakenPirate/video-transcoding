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

  const accessToken = c.get("accessToken")?.value;
  if (!accessToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch {
    // API unreachable — don't crash the page
  }

  return null;
}
