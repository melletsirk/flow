import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ checklistId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checklistId } = await params;
    const { text } = await req.json();

    const checklist = await prisma.checklist.findFirst({
      where: { id: checklistId, card: { list: { board: { ownerId: session.user.id } } } },
    });
    if (!checklist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = await prisma.checklistItem.create({
      data: { text, checklistId },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("POST /api/checklists/[checklistId]/items error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ checklistId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checklistId } = await params;
    const { id, checked } = await req.json();

    const checklist = await prisma.checklist.findFirst({
      where: { id: checklistId, card: { list: { board: { ownerId: session.user.id } } } },
    });
    if (!checklist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = await prisma.checklistItem.update({
      where: { id },
      data: { checked },
    });

    return NextResponse.json(item);
  } catch (e) {
    console.error("PATCH /api/checklists/[checklistId]/items error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ checklistId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { checklistId } = await params;
    const { id } = await req.json();

    const checklist = await prisma.checklist.findFirst({
      where: { id: checklistId, card: { list: { board: { ownerId: session.user.id } } } },
    });
    if (!checklist) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.checklistItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("DELETE /api/checklists/[checklistId]/items error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
