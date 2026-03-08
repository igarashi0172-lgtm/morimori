import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PostCard from "@/components/PostCard";
import MyPageClient from "@/components/MyPageClient";
import Link from "next/link";
import { PenLine } from "lucide-react";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      posts: {
        take: 12,
        orderBy: { createdAt: "desc" },
        include: { user: true, store: true, _count: { select: { likes: true, comments: true } } },
      },
      _count: { select: { posts: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <MyPageClient user={user} />

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl" style={{ color: "var(--ink)" }}>投稿一覧</h2>
        <Link href="/posts/new" className="btn-primary text-sm">
          <PenLine className="w-3.5 h-3.5" />
          投稿する
        </Link>
      </div>

      {user.posts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed var(--border)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="" className="w-20 h-20 object-contain mx-auto mb-3 opacity-50" />
          <p className="font-display text-4xl mb-2" style={{ color: "var(--border-2)" }}>EMPTY</p>
          <p className="mb-5" style={{ color: "var(--ink-3)", fontSize: "0.875rem" }}>まだ投稿がありません</p>
          <Link href="/posts/new" className="btn-primary">
            <PenLine className="w-3.5 h-3.5" />
            最初の投稿をしよう！
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {user.posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
          {user._count.posts > 12 && (
            <p className="text-center text-sm mt-6" style={{ color: "var(--ink-3)" }}>
              最新12件を表示中 / 全{user._count.posts}件
            </p>
          )}
        </>
      )}
    </div>
  );
}
