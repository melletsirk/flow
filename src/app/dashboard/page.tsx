import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BoardList from "@/components/BoardList";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const boards = await prisma.board.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { lists: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-zinc-900">
      <BoardList boards={boards} userId={session.user.id} />
    </div>
  );
}
