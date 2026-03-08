import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ADMIN_KEY = process.env.ADMIN_KEY ?? "morimori-admin";

export async function POST(req: NextRequest) {
  const key = req.headers.get("x-admin-key") ?? req.nextUrl.searchParams.get("key");
  if (key !== ADMIN_KEY) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { inquiryId } = await req.json();

  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!inquiry.storeName || !inquiry.storeArea || !inquiry.storeGenre) {
    return NextResponse.json({ error: "店舗名・エリア・ジャンルが必要です" }, { status: 400 });
  }

  const store = await prisma.store.create({
    data: {
      name:           inquiry.storeName,
      address:        inquiry.storeAddress ?? "",
      area:           inquiry.storeArea,
      nearestStation: inquiry.storeStation ?? null,
      genre:          inquiry.storeGenre,
      phone:          inquiry.storePhone ?? null,
      hours:          inquiry.storeHours ?? null,
      closedDays:     inquiry.storeClosedDays ?? null,
      imageUrl:       inquiry.storeImageUrl ?? null,
      description:    inquiry.storeDesc ?? null,
      submittedById:  inquiry.submittedById ?? null,
    },
  });

  await prisma.inquiry.update({ where: { id: inquiryId }, data: { status: "done" } });

  return NextResponse.json({ store });
}
