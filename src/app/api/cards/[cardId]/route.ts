import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      labels: true,
      assignees: true,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      checklists: { include: { items: true } },
    },
  });

  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(card);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const data = await req.json();

  if (data.listId) {
    data.order = data.order ?? 0;
  }

  const card = await prisma.card.update({
    where: { id: cardId },
    data,
    include: {
      labels: true,
      assignees: true,
      comments: { include: { user: true } },
      checklists: { include: { items: true } },
    },
  });

  return NextResponse.json(card);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  await prisma.card.delete({ where: { id: cardId } });

  return NextResponse.json({ success: true });
}
