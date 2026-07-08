import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { boardId } = await params;
    const { title } = await req.json();

    const board = await prisma.board.findFirst({
      where: { id: boardId, ownerId: session.user.id },
    });
    if (!board) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const lastList = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    });

    const list = await prisma.list.create({
      data: {
        title,
        boardId,
        order: (lastList?.order ?? -1) + 1,
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (e) {
    console.error("POST /api/boards/[boardId]/lists error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
