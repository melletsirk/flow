"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LabelBadge from "./LabelBadge";
import { FiMessageSquare, FiCheckSquare, FiClock } from "react-icons/fi";

interface CardItemProps {
  card: {
    id: string;
    title: string;
    order: number;
    dueDate: string | null;
    labels: { id: string; name: string; color: string }[];
    assignees: { id: string; name: string | null }[];
    checklists: { id: string; items: { checked: boolean }[] }[];
    comments: { id: string }[];
  };
  onClick: () => void;
}

export default function CardItem({ card, onClick }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", card },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const checklistTotal = card.checklists.reduce((sum, cl) => sum + cl.items.length, 0);
  const checklistDone = card.checklists.reduce(
    (sum, cl) => sum + cl.items.filter((i) => i.checked).length,
    0
  );

  const hasDueDate = card.dueDate && new Date(card.dueDate) > new Date(0);
  const isOverdue = hasDueDate && new Date(card.dueDate!) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-[#22272b] rounded-lg shadow-sm border border-[#dcdfe4] dark:border-[#454f59] p-3 cursor-pointer hover:shadow-md hover:border-[#b3b9c4] dark:hover:border-[#738496] transition-all"
    >
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((l) => (
            <LabelBadge key={l.id} name={l.name} color={l.color} />
          ))}
        </div>
      )}
      <p className="text-sm font-medium text-[#172b4d] dark:text-[#b6c2cf] leading-snug">
        {card.title}
      </p>
      {(checklistTotal > 0 || hasDueDate || card.comments.length > 0) && (
        <div className="flex items-center gap-3 mt-2 text-xs text-[#626f86] dark:text-[#9fadbc]">
          {checklistTotal > 0 && (
            <span className="flex items-center gap-1">
              <FiCheckSquare size={12} />
              {checklistDone}/{checklistTotal}
            </span>
          )}
          {hasDueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? "text-[#ef4444]" : ""}`}>
              <FiClock size={12} />
              {new Date(card.dueDate!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )}
          {card.comments.length > 0 && (
            <span className="flex items-center gap-1">
              <FiMessageSquare size={12} />
              {card.comments.length}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
