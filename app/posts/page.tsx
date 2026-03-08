import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { hidden: false },
    orderBy: { createdAt: "desc" },
    include: { user: true, store: true, _count: { select: { likes: true, comments: true } } },
  });

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <div className="mb-10">
        <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Posts</p>
        <h1 className="font-display leading-none" style={{ fontSize: "clamp(1.8rem, 6vw, 5rem)", color: "var(--ink)" }}>
          みんなの投稿
        </h1>
      </div>
      {posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-6xl mb-3" style={{ color: "var(--border-2)" }}>EMPTY</p>
          <p style={{ color: "var(--ink-3)" }}>まだ投稿がありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}
