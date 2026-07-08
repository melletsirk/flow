"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email") as string,
      password: form.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#0c66e4] via-[#1f845a] to-[#5e4db2]">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Flow</h1>
          <p className="text-white/70 mt-2">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1d2125] rounded-xl shadow-2xl p-6 space-y-4">
          {error && (
            <div className="bg-[#fee2e2] dark:bg-[#4a1c1c] text-[#ef4444] text-sm p-3 rounded-lg flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#44546f] dark:text-[#9fadbc] mb-1">Email</label>
            <div className="relative">
              <FiMail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#626f86]" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full border border-[#dcdfe4] dark:border-[#454f59] rounded-lg pl-10 pr-3 py-2.5 bg-white dark:bg-[#22272b] text-sm text-[#172b4d] dark:text-[#b6c2cf]"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#44546f] dark:text-[#9fadbc] mb-1">Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#626f86]" />
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full border border-[#dcdfe4] dark:border-[#454f59] rounded-lg pl-10 pr-3 py-2.5 bg-white dark:bg-[#22272b] text-sm text-[#172b4d] dark:text-[#b6c2cf]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0c66e4] hover:bg-[#0055cc] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? "Signing in..." : (
              <>
                <FiLogIn size={16} />
                Sign In
              </>
            )}
          </button>
          <p className="text-sm text-center text-[#626f86]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#0c66e4] hover:underline font-medium">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
