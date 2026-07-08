import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const { name, color } = await req.json();

  const label = await prisma.label.create({
    data: { name, color, cardId },
  });

  return NextResponse.json(label, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const { id } = await req.json();
  await prisma.label.deleteMany({ where: { id, cardId } });

  return NextResponse.json({ success: true });
}
