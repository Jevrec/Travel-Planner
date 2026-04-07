"use client";
// app/register/page.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/api/auth/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    setLoading(false);

    if (result?.error) {
      setError(result.error);
    }
    // On success, registerUser auto redirects to /dashboard via signIn
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-bl from-white to-primary">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-1">Sign up</h1>
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
          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Enter password again"
              required
              className="bg-backdiv w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
