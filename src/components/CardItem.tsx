"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LabelBadge from "./LabelBadge";

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
    opacity: isDragging ? 0.5 : 1,
  };

  const checklistTotal = card.checklists.reduce((sum, cl) => sum + cl.items.length, 0);
  const checklistDone = card.checklists.reduce(
    (sum, cl) => sum + cl.items.filter((i) => i.checked).length,
    0
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700 p-3 cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
    >
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((l) => (
            <LabelBadge key={l.id} name={l.name} color={l.color} />
          ))}
        </div>
      )}
      <p className="text-sm font-medium">{card.title}</p>
      <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
        {card.dueDate && (
          <span>{new Date(card.dueDate).toLocaleDateString()}</span>
        )}
        {checklistTotal > 0 && (
          <span>{checklistDone}/{checklistTotal}</span>
        )}
        {card.comments.length > 0 && (
          <span>{card.comments.length} comments</span>
        )}
      </div>
    </div>
  );
}
