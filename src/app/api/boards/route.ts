import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const boards = await prisma.board.findMany({
      where: { ownerId: session.user.id },
      include: { _count: { select: { lists: true } } },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(boards);
  } catch (e) {
    console.error("GET /api/boards error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, color } = await req.json();
    const board = await prisma.board.create({
      data: {
        title,
        color: color || "#2563eb",
        ownerId: session.user.id,
      },
      include: { _count: { select: { lists: true } } },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (e) {
    console.error("POST /api/boards error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
