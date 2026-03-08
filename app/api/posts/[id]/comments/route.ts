import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: postId } = await params;
  const { body } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ error: "本文を入力してください" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: { userId: session.user.id, postId, body: body.trim().slice(0, 500) },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json({ comment });
}
