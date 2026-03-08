import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const {
    type, storeName, storeId, body, name, email,
    storeAddress, storeArea, storeStation, storeGenre,
    storePhone, storeHours, storeClosedDays, storeImageUrl, storeDesc,
  } = await req.json();

  if (!type || !body?.trim()) {
    return NextResponse.json({ error: "種別と内容は必須です" }, { status: 400 });
  }

  const session = await auth();
  const submittedById = session?.user?.id ?? null;

  const inquiry = await prisma.inquiry.create({
    data: {
      type,
      storeName:      storeName?.trim()      || null,
      storeId:        storeId                || null,
      body:           body.trim(),
      name:           name?.trim()           || null,
      email:          email?.trim()          || null,
      storeAddress:   storeAddress?.trim()   || null,
      storeArea:      storeArea              || null,
      storeStation:   storeStation?.trim()   || null,
      storeGenre:     storeGenre             || null,
      storePhone:     storePhone?.trim()     || null,
      storeHours:     storeHours?.trim()     || null,
      storeClosedDays: storeClosedDays?.trim() || null,
      storeImageUrl:  storeImageUrl?.trim()  || null,
      storeDesc:      storeDesc?.trim()      || null,
      submittedById,
    },
  });

  return NextResponse.json({ inquiry });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = await req.json();
  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ inquiry });
}
