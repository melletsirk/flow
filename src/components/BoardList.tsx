"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";

interface Board {
  id: string;
  title: string;
  color: string;
  _count: { lists: number };
}

export default function BoardList({ boards: initial }: { boards: Board[]; userId: string }) {
  const router = useRouter();
  const [boards, setBoards] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");

  async function createBoard() {
    if (!title.trim()) return;
    const res = await fetch("/api/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    if (res.ok) {
      const board = await res.json();
      setBoards([board, ...boards]);
      setTitle("");
      setShowForm(false);
      router.refresh();
    }
  }

  async function deleteBoard(id: string) {
    await fetch(`/api/boards/${id}`, { method: "DELETE" });
    setBoards(boards.filter((b) => b.id !== id));
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">My Boards</h1>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              New Board
            </button>
          </div>

          {showForm && (
            <div className="mb-6 flex gap-2">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createBoard();
                  if (e.key === "Escape") { setShowForm(false); setTitle(""); }
                }}
                placeholder="Board title"
                className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-sm"
              />
              <button onClick={createBoard} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                Create
              </button>
              <button onClick={() => { setShowForm(false); setTitle(""); }} className="text-zinc-500 hover:text-zinc-700 px-3 text-sm">
                Cancel
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden group"
              >
                <div
                  className="h-24 flex items-end p-4 cursor-pointer"
                  style={{ backgroundColor: board.color }}
                  onClick={() => router.push(`/board/${board.id}`)}
                >
                  <h3 className="text-white font-semibold text-lg drop-shadow-sm">
                    {board.title}
                  </h3>
                </div>
                <div className="p-3 flex items-center justify-between bg-white dark:bg-zinc-800">
                  <span className="text-xs text-zinc-500">
                    {board._count.lists} list{board._count.lists !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBoard(board.id);
                    }}
                    className="text-xs text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
