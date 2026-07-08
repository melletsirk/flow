"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import { FiPlus, FiGrid, FiTrash2 } from "react-icons/fi";

const BOARD_COLORS = [
  "#0c66e4", "#1f845a", "#216e4e", "#5e4db2",
  "#974f0f", "#a54800", "#ae2a19", "#943d73",
  "#4bce97", "#579dff", "#9f8fef", "#f5cd47",
];

interface Board {
  id: string;
  title: string;
  color: string;
  _count?: { lists: number };
}

export default function BoardList({ boards: initial }: { boards: Board[]; userId: string }) {
  const router = useRouter();
  const [boards, setBoards] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(BOARD_COLORS[0]);
  const [error, setError] = useState("");

  async function createBoard() {
    if (!title.trim()) return;
    setError("");
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), color }),
    });
    if (res.ok) {
      const board = await res.json();
      setBoards([board, ...boards]);
      setTitle("");
      setShowForm(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to create board. Try signing out and back in.");
    }
  }

  async function deleteBoard(id: string) {
    try {
      const res = await fetch(`/api/boards/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setBoards(boards.filter((b) => b.id !== id));
      router.refresh();
    } catch (e) {
      console.error("Failed to delete board:", e);
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FiGrid size={24} className="text-[#44546f]" />
              <h1 className="text-2xl font-bold text-[#172b4d] dark:text-[#b6c2cf]">Boards</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#0c66e4] hover:bg-[#0055cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
            >
              <FiPlus size={16} />
              New Board
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white dark:bg-[#2c333a] rounded-xl shadow-sm border border-[#dcdfe4] dark:border-[#454f59] p-5 space-y-4">
              {error && (
                <div className="bg-[#fee2e2] dark:bg-[#4a1c1c] text-[#ef4444] text-sm p-3 rounded-lg">{error}</div>
              )}
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createBoard();
                  if (e.key === "Escape") { setShowForm(false); setTitle(""); }
                }}
                placeholder="Board title"
                className="w-full border border-[#dcdfe4] dark:border-[#454f59] rounded-lg px-4 py-2.5 bg-white dark:bg-[#1d2125] text-sm focus:outline-2 focus:outline-[#388bff]"
              />
              <div>
                <label className="block text-xs font-medium text-[#44546f] dark:text-[#9fadbc] mb-2">Background</label>
                <div className="flex gap-2">
                  {BOARD_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-lg transition-all ${color === c ? "ring-2 ring-offset-2 ring-[#0c66e4] scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setShowForm(false); setTitle(""); }}
                  className="px-4 py-2 text-sm text-[#44546f] dark:text-[#9fadbc] hover:bg-[#dcdfe4] dark:hover:bg-[#454f59] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createBoard}
                  className="px-4 py-2 text-sm font-medium bg-[#0c66e4] hover:bg-[#0055cc] text-white rounded-lg transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          )}

          {boards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#dcdfe4] dark:bg-[#454f59] flex items-center justify-center">
                <FiGrid size={28} className="text-[#626f86]" />
              </div>
              <h2 className="text-xl font-semibold text-[#44546f] dark:text-[#9fadbc] mb-2">No boards yet</h2>
              <p className="text-[#626f86] mb-6">Create your first board to get started</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
              >
                Create Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {boards.map((board) => (
                <div
                  key={board.id}
                  className="rounded-xl shadow-sm border border-[#dcdfe4] dark:border-[#454f59] overflow-hidden group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => router.push(`/board/${board.id}`)}
                >
                  <div
                    className="h-28 flex items-end p-4 relative"
                    style={{ backgroundColor: board.color }}
                  >
                    <h3 className="text-white font-bold text-base drop-shadow-sm">
                      {board.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBoard(board.id);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                  <div className="p-3 bg-white dark:bg-[#2c333a]">
                    <span className="text-xs text-[#626f86]">
                      {board._count?.lists ?? 0} list{(board._count?.lists ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
