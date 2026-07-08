import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId } = await params;
    const { name, color } = await req.json();

    const card = await prisma.card.findFirst({
      where: { id: cardId, list: { board: { ownerId: session.user.id } } },
    });
    if (!card) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const label = await prisma.label.create({
      data: { name, color, cardId },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (e) {
    console.error("POST /api/cards/[cardId]/labels error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { cardId } = await params;
    const { id } = await req.json();

    const card = await prisma.card.findFirst({
      where: { id: cardId, list: { board: { ownerId: session.user.id } } },
    });
    if (!card) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.label.deleteMany({ where: { id, cardId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/cards/[cardId]/labels error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
