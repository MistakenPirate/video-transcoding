"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signUpSchema } from "./validation";

export async function signUp(formData: FormData) {
  const validatedFields = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const res = await fetch("http://localhost:8000/auth/register", {
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
