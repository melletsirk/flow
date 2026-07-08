"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "./Modal";
import LabelBadge from "./LabelBadge";
import { LABEL_COLORS } from "@/lib/utils";
import { format } from "date-fns";

interface CardData {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  labels: { id: string; name: string; color: string }[];
  assignees: { id: string; name: string | null; email: string }[];
  comments: { id: string; text: string; createdAt: string; user: { id: string; name: string | null } }[];
  checklists: { id: string; title: string; items: { id: string; text: string; checked: boolean }[] }[];
}

export default function CardModal({
  cardId,
  open,
  onClose,
  onUpdate,
}: {
  cardId: string | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [card, setCard] = useState<CardData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [commentText, setCommentText] = useState("");
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].value);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [checklistInputs, setChecklistInputs] = useState<Record<string, string>>({});

  const fetchCard = useCallback(async () => {
    if (!cardId) return;
    const res = await fetch(`/api/cards/${cardId}`);
    if (res.ok) setCard(await res.json());
  }, [cardId]);

  useEffect(() => {
    if (open && cardId) fetchCard();
  }, [open, cardId, fetchCard]);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description ?? "");
    }
  }, [card]);

  async function saveTitle() {
    if (!title.trim() || !card) return;
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    onUpdate();
    fetchCard();
  }

  async function saveDescription() {
    if (!card) return;
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    onUpdate();
  }

  async function addLabel() {
    if (!newLabelName.trim() || !card) return;
    const res = await fetch(`/api/cards/${card.id}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newLabelName, color: newLabelColor }),
    });
    if (res.ok) {
      setNewLabelName("");
      fetchCard();
      onUpdate();
    }
  }

  async function removeLabel(labelId: string) {
    if (!card) return;
    await fetch(`/api/cards/${card.id}/labels`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: labelId }),
    });
    fetchCard();
    onUpdate();
  }

  async function addComment() {
    if (!commentText.trim() || !card) return;
    const res = await fetch(`/api/cards/${card.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: commentText }),
    });
    if (res.ok) {
      setCommentText("");
      fetchCard();
      onUpdate();
    }
  }

  async function addChecklist() {
    if (!newChecklistTitle.trim() || !card) return;
    const res = await fetch(`/api/cards/${card.id}/checklists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newChecklistTitle }),
    });
    if (res.ok) {
      setNewChecklistTitle("");
      fetchCard();
      onUpdate();
    }
  }

  async function addChecklistItem(checklistId: string) {
    const text = checklistInputs[checklistId]?.trim();
    if (!text) return;
    await fetch(`/api/checklists/${checklistId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setChecklistInputs((prev) => ({ ...prev, [checklistId]: "" }));
    fetchCard();
    onUpdate();
  }

  async function toggleChecklistItem(itemId: string, checked: boolean) {
    await fetch(`/api/checklists/${"dummy"}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId, checked: !checked }),
    });
    fetchCard();
    onUpdate();
  }

  async function updateDueDate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!card) return;
    const value = e.target.value;
    await fetch(`/api/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dueDate: value || null }),
    });
    fetchCard();
    onUpdate();
  }

  if (!card) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 space-y-6">
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            className="w-full text-xl font-bold bg-transparent border-none outline-none"
          />
        </div>

        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-2">Description</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
                rows={3}
                placeholder="Add a description..."
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-3 py-2 bg-white dark:bg-zinc-700 text-sm resize-none"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-2">Activity</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addComment()}
                    placeholder="Write a comment..."
                    className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-3 py-2 bg-white dark:bg-zinc-700 text-sm"
                  />
                  <button onClick={addComment} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">
                    Send
                  </button>
                </div>
                {card.comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-medium">{c.user.name || "User"}</span>
                    <span className="text-zinc-400 ml-2">{format(new Date(c.createdAt), "MMM d, h:mm a")}</span>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-300">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-zinc-500 mb-2">Checklists</h3>
              <div className="space-y-3">
                {card.checklists.map((cl) => {
                  const done = cl.items.filter((i) => i.checked).length;
                  const total = cl.items.length;
                  return (
                    <div key={cl.id} className="border border-zinc-200 dark:border-zinc-700 rounded p-3">
                      <h4 className="text-sm font-medium mb-2">{cl.title} ({done}/{total})</h4>
                      <div className="space-y-1">
                        {cl.items.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(item.id, item.checked)}
                              className="rounded"
                            />
                            <span className={item.checked ? "line-through text-zinc-400" : ""}>
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <input
                          value={checklistInputs[cl.id] || ""}
                          onChange={(e) =>
                            setChecklistInputs((prev) => ({ ...prev, [cl.id]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === "Enter" && addChecklistItem(cl.id)}
                          placeholder="Add item"
                          className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs"
                        />
                        <button
                          onClick={() => addChecklistItem(cl.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex gap-2">
                  <input
                    value={newChecklistTitle}
                    onChange={(e) => setNewChecklistTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addChecklist()}
                    placeholder="New checklist"
                    className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs"
                  />
                  <button onClick={addChecklist} className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="w-48 space-y-4">
            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Due Date</h3>
              <input
                type="date"
                value={card.dueDate ? format(new Date(card.dueDate), "yyyy-MM-dd") : ""}
                onChange={updateDueDate}
                className="w-full border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-sm"
              />
            </div>

            <div>
              <h3 className="text-xs font-medium text-zinc-500 uppercase mb-2">Labels</h3>
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.map((l) => (
                  <button key={l.id} onClick={() => removeLabel(l.id)} className="hover:opacity-80">
                    <LabelBadge name={l.name} color={l.color} />
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="flex-1 border border-zinc-300 dark:border-zinc-600 rounded px-2 py-1 text-xs"
                />
                <select
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="border border-zinc-300 dark:border-zinc-600 rounded px-1 py-1 text-xs"
                >
                  {LABEL_COLORS.map((lc) => (
                    <option key={lc.value} value={lc.value}>
                      {lc.name}
                    </option>
                  ))}
                </select>
                <button onClick={addLabel} className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
