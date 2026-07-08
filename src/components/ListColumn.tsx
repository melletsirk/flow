"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardItem from "./CardItem";
import AddCardForm from "./AddCardForm";

interface ListColumnProps {
  list: {
    id: string;
    title: string;
    order: number;
    cards: {
      id: string;
      title: string;
      order: number;
      dueDate: string | null;
      labels: { id: string; name: string; color: string }[];
      assignees: { id: string; name: string | null }[];
      checklists: { id: string; items: { checked: boolean }[] }[];
      comments: { id: string }[];
    }[];
  };
  onCardClick: (cardId: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function ListColumn({ list, onCardClick, onRename, onDelete, onRefresh }: ListColumnProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list", list },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  async function saveTitle() {
    if (!title.trim()) return;
    await fetch(`/api/lists/${list.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setEditing(false);
    onRename(list.id, title.trim());
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-zinc-100 dark:bg-zinc-800/50 rounded-lg w-72 shrink-0 flex flex-col max-h-full"
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing"
      >
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTitle();
              if (e.key === "Escape") { setEditing(false); setTitle(list.title); }
            }}
            className="font-semibold text-sm bg-white dark:bg-zinc-700 border border-blue-500 rounded px-2 py-0.5 w-full"
          />
        ) : (
          <h3
            className="font-semibold text-sm cursor-text"
            onClick={() => { setEditing(true); setTitle(list.title); }}
          >
            {list.title}
          </h3>
        )}
        <button
          onClick={() => onDelete(list.id)}
          className="text-zinc-400 hover:text-red-500 text-xs ml-2"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card.id)} />
          ))}
        </SortableContext>
        <AddCardForm listId={list.id} onAdd={onRefresh} />
      </div>
    </div>
  );
}
