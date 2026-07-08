import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}

export async function PATCH(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const data = await req.json();
  const board = await prisma.board.updateMany({
    where: { id: boardId, ownerId: session.user.id },
    data,
  });

  return NextResponse.json(board);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  await prisma.board.deleteMany({
    where: { id: boardId, ownerId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
