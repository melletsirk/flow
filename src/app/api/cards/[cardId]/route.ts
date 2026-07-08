import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId } = await params;
    const card = await prisma.card.findFirst({
      where: { id: cardId, list: { board: { ownerId: session.user.id } } },
      include: {
        labels: true,
        assignees: true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
        checklists: { include: { items: true } },
      },
    });

    if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(card);
  } catch (e) {
    console.error("GET /api/cards/[cardId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId } = await params;
    const data = await req.json();

    const card = await prisma.card.findFirst({
      where: { id: cardId, list: { board: { ownerId: session.user.id } } },
    });
    if (!card) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.card.update({
      where: { id: cardId },
      data,
      include: {
        labels: true,
        assignees: true,
        comments: { include: { user: true } },
        checklists: { include: { items: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/cards/[cardId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId } = await params;

    const card = await prisma.card.findFirst({
      where: { id: cardId, list: { board: { ownerId: session.user.id } } },
    });
    if (!card) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.card.delete({ where: { id: cardId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/cards/[cardId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
