import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listId } = await params;
  const data = await req.json();
  const list = await prisma.list.update({
    where: { id: listId },
    data,
  });

  return NextResponse.json(list);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ listId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { listId } = await params;
  await prisma.list.delete({ where: { id: listId } });

  return NextResponse.json({ success: true });
}
