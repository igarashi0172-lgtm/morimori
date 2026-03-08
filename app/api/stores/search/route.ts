import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const id = searchParams.get("id");

  if (id) {
    const store = await prisma.store.findUnique({
      where: { id },
      select: { id: true, name: true, area: true, nearestStation: true },
    });
    return NextResponse.json({ store });
  }

  if (!q?.trim()) {
    return NextResponse.json({ stores: [] });
  }

  const stores = await prisma.store.findMany({
    where: { name: { contains: q } },
    select: { id: true, name: true, area: true, nearestStation: true },
    take: 8,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ stores });
}
