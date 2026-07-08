import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { boardId } = await params;
    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: session.user.id },
      include: {
        lists: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
              include: {
                labels: true,
                assignees: true,
                comments: true,
                checklists: { include: { items: true } },
              },
            },
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (e) {
    console.error("GET /api/boards/[boardId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { boardId } = await params;
    const data = await req.json();

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: session.user.id },
    });
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.board.update({
      where: { id: boardId },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/boards/[boardId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { boardId } = await params;

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: session.user.id },
    });
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.board.delete({ where: { id: boardId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/boards/[boardId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
