"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "./actions";
import { signInSchema } from "./validation";

const Signin = () => {
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [clientErrors, setClientErrors] = useState<{ [key: string]: string[] }>(
    {},
  );

  async function handleSubmit(formData: FormData) {
    // Reset errors
    setClientErrors({});

    // Validate form data
    const result = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
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

    const serverResult = await signIn(formData);
    if (serverResult?.errors) {
      setErrors(serverResult.errors);
    }
  }

  function handleInputChange(field: string, value: string) {
    const result = signInSchema.safeParse({
      email: field === "email" ? value : "",
      password: field === "password" ? value : "",
    });

    if (!result.success) {
      const fieldError = result.error.issues.find(
        (error) => error.path[0] === field,
      );
      if (fieldError) {
        setClientErrors((prev) => ({
          ...prev,
          [field]: [fieldError.message],
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
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleSubmit(formData);
            }}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-slate-600 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              {(clientErrors.email || errors.email)?.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full appearance-none rounded-md border border-gray-300 text-slate-600 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>
              {(clientErrors.password || errors.password)?.map((error) => (
                <p key={error} className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              ))}
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signin;
