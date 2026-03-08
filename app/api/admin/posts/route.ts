import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "morimori-admin";

function checkAdmin(req: NextRequest): boolean {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  return key === ADMIN_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user:  { select: { id: true, name: true } },
      store: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
  return NextResponse.json({ posts });
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, hidden } = await req.json();
  const post = await prisma.post.update({ where: { id }, data: { hidden } });
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
