"use client";

import Link from "next/link";
import { useState } from "react";
import { signUp } from "./actions";
import { signUpSchema } from "./validation";
import Footer from "@/components/Footer";

export default function SignUp() {
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [clientErrors, setClientErrors] = useState<{ [key: string]: string[] }>(
    {},
  );

  async function handleSubmit(formData: FormData) {
    setClientErrors({});

    const result = signUpSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!result.success) {
      const formattedErrors: { [key: string]: string[] } = {};
      result.error.issues.forEach((error) => {
        const path = error.path[0].toString();
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(error.message);
      });
      setClientErrors(formattedErrors);
      return;
    }

    const serverResult = await signUp(formData);
    if (serverResult?.errors) {
      setErrors(serverResult.errors);
    }
  }

  function handleInputChange(
    field: string,
    value: string,
    formElement: HTMLFormElement,
  ) {
    const formData = new FormData(formElement);
    formData.set(field, value);

    const result = signUpSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!result.success) {
      const fieldErrors = result.error.issues
        .filter((error) => error.path[0] === field)
        .map((error) => error.message);

      if (fieldErrors.length > 0) {
        setClientErrors((prev) => ({
          ...prev,
          [field]: fieldErrors,
        }));
      } else {
        setClientErrors((prev) => ({
          ...prev,
          [field]: [],
        }));
      }
    } else {
      setClientErrors((prev) => ({
        ...prev,
        [field]: [],
      }));
    }
  }

  return (
    <div className="bg-rf-surface text-rf-on-surface font-[family-name:var(--font-inter)] min-h-screen flex flex-col relative">
      <div className="fixed inset-0 dot-grid pointer-events-none" />

      {/* Header */}
      <header className="bg-rf-surface border-b-2 border-rf-primary/20 sticky top-0 z-50">
        <div className="flex justify-between items-center px-8 h-20 w-full max-w-[1440px] mx-auto">
          <Link
            href="/"
            className="text-2xl font-[family-name:var(--font-space-grotesk)] font-bold tracking-widest text-rf-primary uppercase"
          >
            ReelFlow
          </Link>
          <Link
            href="/signin"
            className="font-[family-name:var(--font-space-grotesk)] uppercase tracking-tighter text-sm font-bold text-rf-secondary hover:text-rf-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">

          {/* Signup Card */}
          <div className="bg-rf-surface-container-high border-2 border-rf-primary border-double relative rotate-[1deg] p-8 shadow-none transition-transform hover:rotate-0 duration-300">
            {/* Diamond Accent */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-rf-primary rotate-45" />

            <div className="mb-6">
              <h2 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-rf-primary mb-2">
                Create a new account
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                handleSubmit(formData);
              }}
              className="space-y-6"
            >
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-primary uppercase"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="operator@reelflow.app"
                  className="w-full bg-rf-surface border-b-2 border-x-0 border-t-0 border-rf-primary focus:border-rf-tertiary focus:ring-0 px-4 py-3 text-rf-on-surface placeholder-rf-outline-variant outline-none transition-colors rounded-none"
                  onChange={(e) =>
                    handleInputChange("email", e.target.value, e.target.form!)
                  }
                />
                {(clientErrors.email || errors.email)?.map((error) => (
                  <p key={error} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-primary uppercase"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-rf-surface border-b-2 border-x-0 border-t-0 border-rf-primary focus:border-rf-tertiary focus:ring-0 px-4 py-3 text-rf-on-surface placeholder-rf-outline-variant outline-none transition-colors rounded-none"
                  onChange={(e) =>
                    handleInputChange(
                      "password",
                      e.target.value,
                      e.target.form!,
                    )
                  }
                />
                {(clientErrors.password || errors.password)?.map((error) => (
                  <p key={error} className="text-sm text-red-600">
                    {error}
                  </p>
                ))}
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="font-[family-name:var(--font-space-grotesk)] text-[11px] font-medium tracking-[0.2em] text-rf-primary uppercase"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-rf-surface border-b-2 border-x-0 border-t-0 border-rf-primary focus:border-rf-tertiary focus:ring-0 px-4 py-3 text-rf-on-surface placeholder-rf-outline-variant outline-none transition-colors rounded-none"
                  onChange={(e) =>
                    handleInputChange(
                      "confirmPassword",
                      e.target.value,
                      e.target.form!,
                    )
                  }
                />
                {(clientErrors.confirmPassword || errors.confirmPassword)?.map(
                  (error) => (
                    <p key={error} className="text-sm text-red-600">
                      {error}
                    </p>
                  ),
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-rf-primary text-rf-on-primary font-[family-name:var(--font-space-grotesk)] text-sm font-semibold tracking-[0.1em] uppercase py-4 px-6 border border-rf-primary hover:bg-rf-primary-container hover:border-rf-tertiary hover:border-b-4 active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 rounded-none"
                >
                  Create account
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-rf-secondary">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-rf-primary hover:underline hover:decoration-rf-tertiary hover:decoration-2 transition-all"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
