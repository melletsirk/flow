"use client";

import { useState } from "react";

export default function AddCardForm({ listId, onAdd }: { listId: string; onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  async function handleSubmit() {
    if (!title.trim()) return;
    await fetch(`/api/lists/${listId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setTitle("");
    setOpen(false);
    onAdd();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded px-2 py-1.5 transition-colors"
      >
        + Add card
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
        className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-3 py-2 bg-white dark:bg-zinc-800 text-sm"
      />
      <div className="flex gap-2">
        <button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">
          Add
        </button>
        <button onClick={() => { setOpen(false); setTitle(""); }} className="text-zinc-500 hover:text-zinc-700 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
