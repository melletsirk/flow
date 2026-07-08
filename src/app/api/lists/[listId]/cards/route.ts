import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listId } = await params;
  const { title } = await req.json();

  const lastCard = await prisma.card.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
  });

  const card = await prisma.card.create({
    data: {
      title,
      listId,
      order: (lastCard?.order ?? -1) + 1,
    },
    include: {
      labels: true,
      assignees: true,
      comments: true,
      checklists: { include: { items: true } },
    },
  });

  return NextResponse.json(card, { status: 201 });
}
