"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signInSchema } from "./validation";

export async function signIn(formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const res = await fetch("http://localhost:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();

    return {
      errors: err.details ?? { email: [err.error] },
    };
  }

  const data = await res.json();

  const c = await cookies();
  c.set("accessToken", data.accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  c.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  redirect("/dashboard");
}
