import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const { title } = await req.json();

  const checklist = await prisma.checklist.create({
    data: { title, cardId },
    include: { items: true },
  });

  return NextResponse.json(checklist, { status: 201 });
}
