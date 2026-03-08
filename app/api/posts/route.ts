import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, storeId, mediaUrls, isCompleted } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: session.user.id,
      title,
      body: body || null,
      storeId: storeId || null,
      mediaUrls: JSON.stringify(mediaUrls ?? []),
      isCompleted: isCompleted ?? false,
    },
  });

  return NextResponse.json({ post });
}
