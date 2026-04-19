"use client";
// app/login/page.tsx

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      const session = await getSession();
      router.push(session?.user?.isAdmin ? "/admin" : "/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-bl from-white to-primary">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Sign in</h1>
        <p className="text-sm font-light text-gray-400 text-center mb-6">
          Every school activity in one place
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Enter email"
              required
              className="bg-backdiv w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Enter password"
              required
              className="bg-backdiv w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-black font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
        <Link
          className="text-sm flex justify-center text-primary hover:text-secondary"
          href="/"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
