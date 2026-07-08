"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CardItem from "./CardItem";
import AddCardForm from "./AddCardForm";
import { FiMoreHorizontal } from "react-icons/fi";

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
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function ListColumn({ list, onCardClick, onDelete, onRefresh }: ListColumnProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: list.id,
    data: { type: "list", list },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  async function saveTitle() {
    if (!title.trim()) return;
    await fetch(`/api/lists/${list.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    setEditing(false);
  }

  const cardCount = list.cards.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-[#101204]/80 backdrop-blur-sm rounded-xl w-72 shrink-0 flex flex-col max-h-full"
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div {...attributes} {...listeners} className="drag-handle">
            <div className="w-1 h-6 rounded-full bg-white/30" />
          </div>
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
              className="font-semibold text-sm text-white bg-white/20 backdrop-blur-sm rounded px-2 py-0.5 w-full outline-none focus:bg-white/30"
            />
          ) : (
            <h3
              className="font-semibold text-sm text-white cursor-text truncate"
              onClick={() => { setEditing(true); setTitle(list.title); }}
            >
              {list.title}
            </h3>
          )}
          <span className="text-xs text-white/50 font-medium ml-auto shrink-0">
            {cardCount}
          </span>
        </div>
        <div className="relative shrink-0 ml-1">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-white/50 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
          >
            <FiMoreHorizontal size={16} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-[#282e33] rounded-lg shadow-xl border border-[#dcdfe4] dark:border-[#454f59] py-1 z-20 w-32">
              <button
                onClick={() => { onDelete(list.id); setShowMenu(false); }}
                className="w-full text-left px-3 py-2 text-sm text-[#ef4444] hover:bg-[#dcdfe4] dark:hover:bg-[#454f59] transition-colors"
              >
                Delete list
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-0">
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
