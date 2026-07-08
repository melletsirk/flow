import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listId } = await params;
    const data = await req.json();

    const list = await prisma.list.findFirst({
      where: { id: listId, board: { ownerId: session.user.id } },
    });
    if (!list) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.list.update({
      where: { id: listId },
      data,
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/lists/[listId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listId } = await params;

    const list = await prisma.list.findFirst({
      where: { id: listId, board: { ownerId: session.user.id } },
    });
    if (!list) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.list.delete({ where: { id: listId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/lists/[listId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
