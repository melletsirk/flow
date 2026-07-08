"use client";

export default function LabelBadge({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {name}
    </span>
  );
}
