import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId } = await params;
  const { text } = await req.json();

  const comment = await prisma.comment.create({
    data: { text, cardId, userId: session.user.id },
    include: { user: true },
  });

  return NextResponse.json(comment, { status: 201 });
}
