"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import Navbar from "@/components/Navbar";
import ListColumn from "@/components/ListColumn";
import CardModal from "@/components/CardModal";
import CardItem from "@/components/CardItem";
import { FiPlus, FiEdit3 } from "react-icons/fi";

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
  const { data: session, status } = useSession();
  const [board, setBoard] = useState<Board | null>(null);
  const [boardId, setBoardId] = useState<string>("");
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [activeCardData, setActiveCardData] = useState<CardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  useEffect(() => {
    params.then((p) => setBoardId(p.boardId));
  }, [params]);

  const fetchBoard = useCallback(async () => {
    if (!boardId) return;
    setError(null);
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.status === 404) {
        setError("Board not found");
        setBoard(null);
      } else if (res.ok) {
        const data = await res.json();
        setBoard(data);
        setTitle(data.title);
      } else {
        setError("Failed to load board");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    if (boardId) {
      setLoading(true);
      fetchBoard();
    }
  }, [boardId, fetchBoard]);

  if (status === "loading") {
    return (
      <div className="flex flex-col flex-1">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-[#626f86]">Loading...</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function saveTitle() {
    if (!title.trim()) return;
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });
      if (!res.ok) console.error("saveTitle failed:", res.status);
    } catch (err) {
      console.error("saveTitle network error:", err);
    }
    setEditingTitle(false);
    fetchBoard();
  }

  async function addList() {
    if (!newListTitle.trim() || !boardId) return;
    try {
      const res = await fetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newListTitle.trim() }),
      });
      if (!res.ok) console.error("addList failed:", res.status);
    } catch (err) {
      console.error("addList network error:", err);
    }
    setNewListTitle("");
    setAddingList(false);
    fetchBoard();
  }

  async function deleteList(listId: string) {
    try {
      const res = await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      if (!res.ok) console.error("deleteList failed:", res.status);
    } catch (err) {
      console.error("deleteList network error:", err);
    }
    fetchBoard();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const listIds = useMemo(() => board?.lists.map((l) => l.id) || [], [board]);

  function handleDragStart(event: DragEndEvent) {
    const { active } = event;
    const data = active.data.current;
    if (data?.type === "card") {
      setActiveCard(active.id as string);
      setActiveCardData(data.card as CardData);
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
              return { ...l, cards: l.cards.filter((c) => c.id !== active.id) };
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
    setActiveCardData(null);

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

      if (activeListId && overListId) {
        if (activeListId === overListId) {
          const cards = board?.lists.find((l) => l.id === activeListId)?.cards || [];
          cards.forEach((c, i) => {
            fetch(`/api/cards/${c.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: i }),
            });
          });
        } else {
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

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <div
        className="flex-1 overflow-x-auto overflow-y-hidden"
        style={{ backgroundColor: board?.color || "#1d2125" }}
      >
        <div className="h-full flex flex-col min-w-fit">
          <div className="flex items-center gap-3 px-6 pt-4 pb-3 shrink-0">
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") { setEditingTitle(false); setTitle(board?.title || ""); }
                }}
                className="text-xl font-bold text-white bg-white/20 backdrop-blur-sm rounded px-2 py-1 border-0 outline-none focus:bg-white/30"
              />
            ) : (
              <h1
                className="text-xl font-bold text-white drop-shadow-sm cursor-pointer hover:underline flex items-center gap-2"
                onClick={() => setEditingTitle(true)}
              >
                {board?.title || "Loading..."}
                <FiEdit3 size={14} className="opacity-50" />
              </h1>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-center flex-1">
              <div className="bg-white/15 backdrop-blur-sm text-white rounded-xl p-8 text-center mx-4">
                <p className="text-lg font-medium mb-3">{error}</p>
                <button
                  onClick={() => { setError(null); fetchBoard(); }}
                  className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-lg text-sm transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {loading && !board && !error && (
            <div className="flex items-center justify-center flex-1">
              <div className="animate-pulse text-white/70">Loading board...</div>
            </div>
          )}

          {board && !error && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-3 px-4 pb-4 h-full overflow-x-auto items-start">
                <SortableContext items={listIds} strategy={horizontalListSortingStrategy}>
                  {board.lists.map((list) => (
                    <ListColumn
                      key={list.id}
                      list={list}
                      onCardClick={(cardId) => setActiveCard(cardId)}
                      onDelete={deleteList}
                      onRefresh={fetchBoard}
                    />
                  ))}
                </SortableContext>

                {addingList ? (
                  <div className="bg-[#101204]/80 backdrop-blur-sm rounded-xl w-72 shrink-0 p-3">
                    <input
                      autoFocus
                      value={newListTitle}
                      onChange={(e) => setNewListTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addList();
                        if (e.key === "Escape") { setAddingList(false); setNewListTitle(""); }
                      }}
                      placeholder="List title"
                      className="w-full bg-white dark:bg-[#22272b] border-0 rounded-lg px-3 py-2 text-sm text-[#172b4d] dark:text-[#b6c2cf] placeholder-[#626f86] focus:outline-2 focus:outline-[#388bff] mb-2"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={addList}
                        className="bg-[#579dff] hover:bg-[#388bff] text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                      >
                        Add list
                      </button>
                      <button
                        onClick={() => { setAddingList(false); setNewListTitle(""); }}
                        className="text-white/70 hover:text-white px-2 py-1.5 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingList(true)}
                    className="bg-[#101204]/30 hover:bg-[#101204]/50 text-white rounded-xl w-72 shrink-0 p-3 text-left text-sm transition-colors flex items-center gap-2"
                  >
                    <FiPlus size={16} />
                    Add list
                  </button>
                )}
              </div>

              <DragOverlay>
                {activeCardData ? (
                  <div className="rotate-3 opacity-90">
                    <CardItem card={activeCardData} onClick={() => {}} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        <CardModal
          cardId={activeCard}
          open={!!activeCard}
          onClose={() => setActiveCard(null)}
          onUpdate={fetchBoard}
        />
      </div>
    </div>
  );
}
