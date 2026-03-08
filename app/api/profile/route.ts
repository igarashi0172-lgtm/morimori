import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, bio, image, instagram, tiktok, youtube, twitter } = await req.json();

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name: name.trim() || null }),
      ...(bio !== undefined && { bio: bio.trim() || null }),
      ...(image !== undefined && { image }),
      ...(instagram !== undefined && { instagram: instagram.trim() || null }),
      ...(tiktok !== undefined && { tiktok: tiktok.trim() || null }),
      ...(youtube !== undefined && { youtube: youtube.trim() || null }),
      ...(twitter !== undefined && { twitter: twitter.trim() || null }),
    },
    select: { id: true, name: true, bio: true, image: true, instagram: true, tiktok: true, youtube: true, twitter: true },
  });

  return NextResponse.json({ user });
}
