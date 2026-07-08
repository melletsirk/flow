import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ checklistId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checklistId } = await params;
    const data = await req.json();

    const checklist = await prisma.checklist.findFirst({
      where: { id: checklistId, card: { list: { board: { ownerId: session.user.id } } } },
    });
    if (!checklist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.checklist.update({
      where: { id: checklistId },
      data,
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error("PATCH /api/checklists/[checklistId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ checklistId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checklistId } = await params;

    const checklist = await prisma.checklist.findFirst({
      where: { id: checklistId, card: { list: { board: { ownerId: session.user.id } } } },
    });
    if (!checklist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.checklist.delete({ where: { id: checklistId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/checklists/[checklistId] error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
