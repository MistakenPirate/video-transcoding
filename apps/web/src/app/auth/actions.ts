"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function decodeJwtPayload(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
  return user;
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

  const payload = decodeJwtPayload(accessToken);
  if (!payload?.userId || !payload?.email) return null;

  return { userId: payload.userId, email: payload.email };
}
