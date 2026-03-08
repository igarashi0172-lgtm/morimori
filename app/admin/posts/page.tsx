import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminPostsClient from "./AdminPostsClient";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  const adminKey = process.env.ADMIN_KEY ?? "morimori-admin";
  if (key !== adminKey) redirect(`/admin/inquiries/login`);

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user:  { select: { id: true, name: true } },
      store: { select: { id: true, name: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <AdminPostsClient
      initialPosts={posts.map(p => ({ ...p, createdAt: p.createdAt.toISOString() }))}
    />
  );
}
