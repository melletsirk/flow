"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isBoard = pathname?.startsWith("/board/");

  return (
    <nav className="bg-[#1d2125] text-white px-4 py-2 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        {isBoard && (
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-[#b6c2cf] hover:text-white transition-colors"
          >
            <FiArrowLeft size={16} />
            Boards
          </Link>
        )}
        <Link href="/dashboard" className="text-lg font-bold tracking-tight">
          Flow
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-[#579dff] flex items-center justify-center text-xs font-bold text-white">
          {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "?"}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-sm text-[#b6c2cf] hover:text-white transition-colors"
          title="Sign out"
        >
          <FiLogOut size={16} />
        </button>
      </div>
    </nav>
  );
}
