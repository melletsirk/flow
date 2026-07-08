"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import Navbar from "@/components/Navbar";
import ListColumn from "@/components/ListColumn";
import CardModal from "@/components/CardModal";

interface Board {
  id: string;
  title: string;
  color: string;
  lists: ListData[];
}

interface ListData {
  id: string;
  title: string;
  order: number;
  cards: CardData[];
}

interface CardData {
  id: string;
  title: string;
  order: number;
  description: string | null;
  dueDate: string | null;
  labels: { id: string; name: string; color: string }[];
  assignees: { id: string; name: string | null }[];
  checklists: { id: string; items: { checked: boolean }[] }[];
  comments: { id: string }[];
}

export default function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [board, setBoard] = useState<Board | null>(null);
  const [boardId, setBoardId] = useState<string>("");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [activeList, setActiveList] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setBoardId(p.boardId));
  }, [params]);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) setBoard(await res.json());
    } catch { /* ignore */ }
  }, [boardId]);

  useEffect(() => {
    if (boardId) fetchBoard();
  }, [boardId, fetchBoard]);

  async function addList() {
    if (!boardId) return;
    const title = prompt("List name");
    if (!title?.trim()) return;
    await fetch(`/api/boards/${boardId}/lists`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim() }),
    });
    fetchBoard();
  }

  async function deleteList(listId: string) {
    await fetch(`/api/lists/${listId}`, { method: "DELETE" });
    fetchBoard();
  }

  async function deleteCard(cardId: string) {
    const allCards = board?.lists.flatMap((l) => l.cards) || [];
    const card = allCards.find((c) => c.id === cardId);
    if (!card) return;

    await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
    fetchBoard();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const listIds = useMemo(() => board?.lists.map((l) => l.id) || [], [board]);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === "card") {
      setActiveCard(active.id as string);
    } else if (data?.type === "list") {
      setActiveList(active.id as string);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "card" && overData?.type === "card") {
      const activeListId = board?.lists.find((l) =>
        l.cards.some((c) => c.id === active.id)
      )?.id;
      const overListId = board?.lists.find((l) =>
        l.cards.some((c) => c.id === over.id)
      )?.id;

      if (activeListId && overListId && activeListId !== overListId) {
        setBoard((prev) => {
          if (!prev) return prev;
          const newLists = prev.lists.map((l) => {
            if (l.id === activeListId) {
              return {
                ...l,
                cards: l.cards.filter((c) => c.id !== active.id),
              };
            }
            if (l.id === overListId) {
              const overCard = l.cards.find((c) => c.id === over.id);
              const activeCardData = prev.lists
                .find((pl) => pl.id === activeListId)
                ?.cards.find((c) => c.id === active.id);
              if (!activeCardData || !overCard) return l;
              const overIdx = l.cards.indexOf(overCard);
              const newCards = [...l.cards];
              newCards.splice(overIdx, 0, activeCardData);
              return { ...l, cards: newCards };
            }
            return l;
          });
          return { ...prev, lists: newLists };
        });
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    setActiveList(null);

    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "list" && overData?.type === "list") {
      const oldIdx = listIds.indexOf(active.id as string);
      const newIdx = listIds.indexOf(over.id as string);
      const newListIds = arrayMove(listIds, oldIdx, newIdx);
      setBoard((prev) => {
        if (!prev) return prev;
        const sortedLists = newListIds
          .map((id) => prev.lists.find((l) => l.id === id)!)
          .filter(Boolean)
          .map((l, i) => ({ ...l, order: i }));
        return { ...prev, lists: sortedLists };
      });
      // Persist list order
      newListIds.forEach((id, idx) => {
        fetch(`/api/lists/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: idx }),
        });
      });
    } else if (activeData?.type === "card" && overData?.type === "card") {
      const activeListId = board?.lists.find((l) =>
        l.cards.some((c) => c.id === active.id)
      )?.id;
      const overListId = board?.lists.find((l) =>
        l.cards.some((c) => c.id === over.id)
      )?.id;

      if (activeListId && overListId && activeListId === overListId) {
        setBoard((prev) => {
          if (!prev) return prev;
          const newLists = prev.lists.map((l) => {
            if (l.id !== activeListId) return l;
            const oldIdx = l.cards.findIndex((c) => c.id === active.id);
            const newIdx = l.cards.findIndex((c) => c.id === over.id);
            const newCards = arrayMove(l.cards, oldIdx, newIdx);
            return { ...l, cards: newCards };
          });
          return { ...prev, lists: newLists };
        });
        const cards = board?.lists.find((l) => l.id === activeListId)?.cards || [];
        cards.forEach((c, i) => {
          fetch(`/api/cards/${c.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: i }),
          });
        });
      } else if (activeListId && overListId && activeListId !== overListId) {
        // Card moved between lists
        const movingCard = board?.lists
          .find((l) => l.id === activeListId)
          ?.cards.find((c) => c.id === active.id);
        if (movingCard) {
          fetch(`/api/cards/${active.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ listId: overListId }),
          });
        }
      }
    }

    fetchBoard();
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center flex-1">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <div
        className="flex-1 overflow-x-auto p-4"
        style={{ backgroundColor: board?.color || "#2563eb" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white drop-shadow-sm">
            {board?.title || "Loading..."}
          </h1>
          <button
            onClick={addList}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            + Add List
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            {activeCard && (
              <CardModal
                cardId={activeCard}
                open={!!activeCard}
                onClose={() => setActiveCard(null)}
                onUpdate={fetchBoard}
              />
            )}
            <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
              {board?.lists.map((list) => (
                <ListColumn
                  key={list.id}
                  list={list}
                  onCardClick={(cardId) => setActiveCard(cardId)}
                  onRename={() => {}}
                  onDelete={deleteList}
                  onRefresh={fetchBoard}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>
    </div>
  );
}
