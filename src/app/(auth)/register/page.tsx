"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiUserPlus } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirm") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-[#5e4db2] via-[#0c66e4] to-[#1f845a]">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Flow</h1>
          <p className="text-white/70 mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1d2125] rounded-xl shadow-2xl p-6 space-y-4">
          {error && (
            <div className="bg-[#fee2e2] dark:bg-[#4a1c1c] text-[#ef4444] text-sm p-3 rounded-lg flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#44546f] dark:text-[#9fadbc] mb-1">Name</label>
            <div className="relative">
              <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#626f86]" />
              <input
                id="name"
                name="name"
                type="text"
                className="w-full border border-[#dcdfe4] dark:border-[#454f59] rounded-lg pl-10 pr-3 py-2.5 bg-white dark:bg-[#22272b] text-sm text-[#172b4d] dark:text-[#b6c2cf]"
              />
            </div>
          </div>
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
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-[#44546f] dark:text-[#9fadbc] mb-1">Confirm Password</label>
            <div className="relative">
              <FiLock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#626f86]" />
              <input
                id="confirm"
                name="confirm"
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
            {loading ? "Creating account..." : (
              <>
                <FiUserPlus size={16} />
                Register
              </>
            )}
          </button>
          <p className="text-sm text-center text-[#626f86]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0c66e4] hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
