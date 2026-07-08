"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-zinc-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
      <Link href="/dashboard" className="text-lg font-bold tracking-tight">
        Flow
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-400">{session?.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-zinc-300 hover:text-white transition-colors"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
