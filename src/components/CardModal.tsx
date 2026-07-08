"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "./Modal";
import LabelBadge from "./LabelBadge";
import { LABEL_COLORS } from "@/lib/utils";
import { format, isValid } from "date-fns";
import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiTag,
  FiCheckSquare,
  FiMessageSquare,
  FiTrash2,
  FiPlus,
  FiType,
} from "react-icons/fi";

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
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [checklistInputs, setChecklistInputs] = useState<Record<string, string>>({});

  const fetchCard = useCallback(async () => {
    if (!cardId) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      if (res.ok) setCard(await res.json());
      else console.error("fetchCard failed:", res.status);
    } catch (err) {
      console.error("fetchCard network error:", err);
    }
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
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) console.error("saveTitle failed:", res.status);
    } catch (err) {
      console.error("saveTitle network error:", err);
    }
    onUpdate();
    fetchCard();
  }

  async function saveDescription() {
    if (!card) return;
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) console.error("saveDescription failed:", res.status);
    } catch (err) {
      console.error("saveDescription network error:", err);
    }
    onUpdate();
  }

  async function deleteCard() {
    if (!card || !confirm("Delete this card?")) return;
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (!res.ok) console.error("deleteCard failed:", res.status);
    } catch (err) {
      console.error("deleteCard network error:", err);
    }
    onUpdate();
    onClose();
  }

  async function addLabel() {
    if (!newLabelName.trim() || !card) return;
    try {
      const res = await fetch(`/api/cards/${card.id}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newLabelName, color: newLabelColor }),
      });
      if (res.ok) {
        setNewLabelName("");
        fetchCard();
        onUpdate();
      } else {
        console.error("addLabel failed:", res.status);
      }
    } catch (err) {
      console.error("addLabel network error:", err);
    }
  }

  async function removeLabel(labelId: string) {
    if (!card) return;
    try {
      const res = await fetch(`/api/cards/${card.id}/labels`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: labelId }),
      });
      if (!res.ok) console.error("removeLabel failed:", res.status);
    } catch (err) {
      console.error("removeLabel network error:", err);
    }
    fetchCard();
    onUpdate();
  }

  async function addComment() {
    if (!commentText.trim() || !card) return;
    try {
      const res = await fetch(`/api/cards/${card.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        fetchCard();
        onUpdate();
      } else {
        console.error("addComment failed:", res.status);
      }
    } catch (err) {
      console.error("addComment network error:", err);
    }
  }

  async function addChecklist() {
    if (!newChecklistTitle.trim() || !card) return;
    try {
      const res = await fetch(`/api/cards/${card.id}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newChecklistTitle }),
      });
      if (res.ok) {
        setNewChecklistTitle("");
        setShowChecklistForm(false);
        fetchCard();
        onUpdate();
      } else {
        console.error("addChecklist failed:", res.status);
      }
    } catch (err) {
      console.error("addChecklist network error:", err);
    }
  }

  async function addChecklistItem(checklistId: string) {
    const text = checklistInputs[checklistId]?.trim();
    if (!text) return;
    try {
      const res = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) console.error("addChecklistItem failed:", res.status);
    } catch (err) {
      console.error("addChecklistItem network error:", err);
    }
    setChecklistInputs((prev) => ({ ...prev, [checklistId]: "" }));
    fetchCard();
    onUpdate();
  }

  async function toggleChecklistItem(checklistId: string, itemId: string, checked: boolean) {
    try {
      const res = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, checked: !checked }),
      });
      if (!res.ok) console.error("toggleChecklistItem failed:", res.status);
    } catch (err) {
      console.error("toggleChecklistItem network error:", err);
    }
    fetchCard();
    onUpdate();
  }

  async function updateDueDate(e: React.ChangeEvent<HTMLInputElement>) {
    if (!card) return;
    const value = e.target.value;
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: value || null }),
      });
      if (!res.ok) console.error("updateDueDate failed:", res.status);
    } catch (err) {
      console.error("updateDueDate network error:", err);
    }
    fetchCard();
    onUpdate();
  }

  if (!card) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-5 space-y-5">
        <div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            className="w-full text-xl font-bold text-[#172b4d] dark:text-[#b6c2cf] bg-transparent border-none outline-none"
          />
        </div>

        <div className="flex gap-6">
          <div className="flex-1 space-y-5">
            <Section icon={FiType} title="Description">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
                rows={3}
                placeholder="Add a description..."
                className="w-full border border-[#dcdfe4] dark:border-[#454f59] rounded-lg px-3 py-2 bg-white dark:bg-[#1d2125] text-sm resize-none text-[#172b4d] dark:text-[#b6c2cf] placeholder-[#626f86]"
              />
            </Section>

            <Section icon={FiMessageSquare} title="Activity">
              <div className="flex gap-2 mb-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addComment()}
                  placeholder="Write a comment..."
                  className="flex-1 border border-[#dcdfe4] dark:border-[#454f59] rounded-lg px-3 py-2 bg-white dark:bg-[#1d2125] text-sm text-[#172b4d] dark:text-[#b6c2cf] placeholder-[#626f86]"
                />
                <button
                  onClick={addComment}
                  className="bg-[#0c66e4] hover:bg-[#0055cc] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Send
                </button>
              </div>
              {card.comments.length === 0 ? (
                <p className="text-sm text-[#626f86]">No comments yet</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {card.comments.map((c) => (
                    <div key={c.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#579dff] flex items-center justify-center text-[10px] font-bold text-white">
                          {(c.user.name || "U")[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-[#172b4d] dark:text-[#b6c2cf]">
                          {c.user.name || "User"}
                        </span>
                        <span className="text-[#626f86] text-xs">
                          {format(new Date(c.createdAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="mt-1 ml-8 text-[#44546f] dark:text-[#9fadbc]">{c.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section icon={FiCheckSquare} title="Checklists">
              <div className="space-y-3">
                {card.checklists.map((cl) => {
                  const done = cl.items.filter((i) => i.checked).length;
                  const total = cl.items.length;
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={cl.id} className="border border-[#dcdfe4] dark:border-[#454f59] rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-[#172b4d] dark:text-[#b6c2cf]">{cl.title}</h4>
                        <span className="text-xs text-[#626f86]">{done}/{total}</span>
                      </div>
                      {total > 0 && (
                        <div className="w-full bg-[#dcdfe4] dark:bg-[#454f59] rounded-full h-1.5 mb-2">
                          <div
                            className="bg-[#1f845a] h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                      <div className="space-y-1">
                        {cl.items.map((item) => (
                          <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklistItem(cl.id, item.id, item.checked)}
                              className="rounded accent-[#1f845a]"
                            />
                            <span
                              className={
                                item.checked
                                  ? "line-through text-[#626f86]"
                                  : "text-[#172b4d] dark:text-[#b6c2cf]"
                              }
                            >
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
                          className="flex-1 border border-[#dcdfe4] dark:border-[#454f59] rounded px-2 py-1 text-xs bg-white dark:bg-[#1d2125]"
                        />
                        <button
                          onClick={() => addChecklistItem(cl.id)}
                          className="text-[#0c66e4] hover:text-[#0055cc] text-xs font-medium"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={() => setShowChecklistForm(true)}
                  className="flex items-center gap-2 text-sm text-[#0c66e4] hover:text-[#0055cc] transition-colors"
                >
                  <FiPlus size={14} />
                  Add checklist
                </button>
                {showChecklistForm && (
                  <div className="flex gap-2">
                    <input
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addChecklist();
                        if (e.key === "Escape") { setShowChecklistForm(false); setNewChecklistTitle(""); }
                      }}
                      placeholder="Checklist title"
                      className="flex-1 border border-[#dcdfe4] dark:border-[#454f59] rounded px-3 py-1.5 text-sm bg-white dark:bg-[#1d2125]"
                      autoFocus
                    />
                    <button onClick={addChecklist} className="bg-[#0c66e4] text-white px-3 py-1.5 rounded text-sm">
                      Add
                    </button>
                    <button onClick={() => { setShowChecklistForm(false); setNewChecklistTitle(""); }} className="text-[#626f86] text-sm">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div className="w-48 space-y-3">
            <SidebarSection icon={FiCalendar} title="Due date">
              <input
                type="date"
                value={
                  card.dueDate && isValid(new Date(card.dueDate))
                    ? format(new Date(card.dueDate), "yyyy-MM-dd")
                    : ""
                }
                onChange={updateDueDate}
                className="w-full border border-[#dcdfe4] dark:border-[#454f59] rounded px-2 py-1 text-sm bg-white dark:bg-[#1d2125]"
              />
            </SidebarSection>

            <SidebarSection icon={FiTag} title="Labels">
              <div className="flex flex-wrap gap-1 mb-2">
                {card.labels.length === 0 && (
                  <span className="text-xs text-[#626f86]">No labels</span>
                )}
                {card.labels.map((l) => (
                  <button key={l.id} onClick={() => removeLabel(l.id)} className="hover:opacity-80 transition-opacity">
                    <LabelBadge name={l.name} color={l.color} />
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Name"
                  className="flex-1 border border-[#dcdfe4] dark:border-[#454f59] rounded px-2 py-1 text-xs bg-white dark:bg-[#1d2125]"
                />
                <select
                  value={newLabelColor}
                  onChange={(e) => setNewLabelColor(e.target.value)}
                  className="border border-[#dcdfe4] dark:border-[#454f59] rounded px-1 py-1 text-xs bg-white dark:bg-[#1d2125]"
                >
                  {LABEL_COLORS.map((lc) => (
                    <option key={lc.value} value={lc.value}>
                      {lc.name}
                    </option>
                  ))}
                </select>
                <button onClick={addLabel} className="text-[#0c66e4] hover:text-[#0055cc] text-xs font-medium">
                  <FiPlus size={14} />
                </button>
              </div>
            </SidebarSection>

            <button
              onClick={deleteCard}
              className="flex items-center gap-2 text-sm text-[#ef4444] hover:text-[#dc2626] transition-colors w-full"
            >
              <FiTrash2 size={14} />
              Delete card
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: IconType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-[#626f86]" />
        <h3 className="text-sm font-semibold text-[#44546f] dark:text-[#9fadbc]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SidebarSection({
  icon: Icon,
  title,
  children,
}: {
  icon: IconType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-[#626f86]" />
        <h3 className="text-xs font-semibold text-[#626f86] uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}
