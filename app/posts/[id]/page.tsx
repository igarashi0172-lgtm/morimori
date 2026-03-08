import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";
import ShareBanner from "@/components/ShareBanner";
import { auth } from "@/auth";
import { Suspense } from "react";

type Props = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const post = await prisma.post.findUnique({
    where: { id },
    include: { user: true, store: true, likes: true, comments: { orderBy: { createdAt: "asc" }, include: { user: true } } },
  });
  if (!post) notFound();

  let images: string[] = [];
  try { images = JSON.parse(post.mediaUrls); } catch { images = []; }

  const isLiked = session?.user?.id ? post.likes.some(l => l.userId === session.user.id) : false;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      {/* 投稿完了シェアバナー */}
      <Suspense>
        <ShareBanner
          postId={post.id}
          title={post.title}
          storeName={post.store?.name ?? null}
          isCompleted={post.isCompleted}
        />
      </Suspense>

      {/* User */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
          style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}
        >
          {post.user.name?.[0] ?? "U"}
        </div>
        <div>
          <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>{post.user.name ?? "匿名"}</div>
          <div className="text-xs" style={{ color: "var(--ink-3)" }}>
            {formatDate(post.createdAt)}
            {post.store && <> · <Link href={`/stores/${post.store.id}`} style={{ color: "var(--red)" }} className="hover:underline">{post.store.name}</Link></>}
          </div>
        </div>
        {post.isCompleted && (
          <div className="ml-auto"><span className="tag tag-green">完食達成！</span></div>
        )}
      </div>

      {/* Title */}
      <h1 className="font-display leading-tight mb-6" style={{ fontSize: "clamp(1.6rem, 6vw, 3.5rem)", color: "var(--ink)" }}>
        {post.title}
      </h1>

      {/* Images */}
      {images.length > 0 && (
        <div className={`grid gap-2 mb-8 rounded-2xl overflow-hidden ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`} style={{ border: "1.5px solid var(--border)" }}>
          {images.map((url, i) => (
            <div key={i} className="aspect-video overflow-hidden" style={{ backgroundColor: "var(--bg-2)" }}>
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Body */}
      {post.body && (
        <div className="text-sm leading-loose mb-8 whitespace-pre-wrap" style={{ color: "var(--ink-2)" }}>
          {post.body}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 py-5 mb-10 flex-wrap" style={{ borderTop: "1.5px solid var(--border)", borderBottom: "1.5px solid var(--border)" }}>
        <LikeButton postId={post.id} initialCount={post.likes.length} initialLiked={isLiked} />

        <div className="ml-auto">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              [
                post.isCompleted ? "【完食達成！】" : "【大盛り記録】",
                post.title,
                post.store ? `📍${post.store.name}` : "",
                "",
                "#MORIMORI #大盛りグルメ",
                `https://morimori.jp/posts/${post.id}`,
              ].filter(Boolean).join("\n")
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full transition-opacity hover:opacity-80"
            style={{
              backgroundColor: "#000",
              color: "#fff",
              border: "1.5px solid #000",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Xでシェア
          </a>
        </div>
      </div>

      <CommentSection postId={post.id} comments={post.comments} currentUserId={session?.user?.id} />
    </div>
  );
}
