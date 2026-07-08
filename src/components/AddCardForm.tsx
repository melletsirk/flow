"use client";

import { useState } from "react";
import { FiPlus } from "react-icons/fi";

export default function AddCardForm({ listId, onAdd }: { listId: string; onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  async function handleSubmit() {
    if (!title.trim()) return;
    try {
      const res = await fetch(`/api/lists/${listId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) console.error("AddCard handleSubmit failed:", res.status);
    } catch (err) {
      console.error("AddCard handleSubmit network error:", err);
    }
    setTitle("");
    setOpen(false);
    onAdd();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-sm text-white/50 hover:text-white/80 hover:bg-white/10 rounded-lg px-2 py-1.5 transition-colors flex items-center gap-2"
      >
        <FiPlus size={14} />
        Add card
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") { setOpen(false); setTitle(""); }
        }}
        placeholder="Enter card title"
        className="w-full border-0 rounded-lg px-3 py-2 bg-white dark:bg-[#1d2125] text-sm text-[#172b4d] dark:text-[#b6c2cf] placeholder-[#626f86] focus:outline-2 focus:outline-[#388bff]"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-[#579dff] hover:bg-[#388bff] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          Add
        </button>
        <button
          onClick={() => { setOpen(false); setTitle(""); }}
          className="text-white/70 hover:text-white px-2 py-1.5 text-sm transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
