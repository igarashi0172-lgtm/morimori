import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { Instagram, Youtube, Twitter, ExternalLink, ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      image: true,
      instagram: true,
      tiktok: true,
      youtube: true,
      twitter: true,
      createdAt: true,
      posts: {
        take: 12,
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        include: { user: true, store: true, _count: { select: { likes: true, comments: true } } },
      },
      _count: { select: { posts: true, submittedStores: true } },
    },
  });

  if (!user) notFound();

  const completedCount = await prisma.post.count({
    where: { userId: id, isCompleted: true, hidden: false },
  });
  const likesAgg = await prisma.like.count({
    where: { post: { userId: id, hidden: false } },
  });

  const snsList = [
    user.instagram && {
      href: `https://instagram.com/${user.instagram}`,
      icon: <Instagram className="w-4 h-4" />,
      label: `@${user.instagram}`,
      color: "#E1306C",
    },
    user.tiktok && {
      href: `https://tiktok.com/@${user.tiktok}`,
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.28 8.28 0 0 0 4.84 1.55V6.82a4.85 4.85 0 0 1-1.07-.13z"/>
        </svg>
      ),
      label: `@${user.tiktok}`,
      color: "#010101",
    },
    user.youtube && {
      href: user.youtube.startsWith("http") ? user.youtube : `https://youtube.com/@${user.youtube}`,
      icon: <Youtube className="w-4 h-4" />,
      label: user.youtube.startsWith("http") ? "YouTube" : `@${user.youtube}`,
      color: "#FF0000",
    },
    user.twitter && {
      href: `https://twitter.com/${user.twitter}`,
      icon: <Twitter className="w-4 h-4" />,
      label: `@${user.twitter}`,
      color: "#1DA1F2",
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; label: string; color: string }[];

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">

      {/* 戻るリンク */}
      <Link
        href="/ranking"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-60"
        style={{ color: "var(--ink-3)", textDecoration: "none" }}
      >
        <ArrowLeft className="w-4 h-4" />
        ランキングに戻る
      </Link>

      {/* プロフィールヘッダー */}
      <div className="flex items-start gap-6 pb-10 mb-10 flex-wrap" style={{ borderBottom: "1.5px solid var(--border)" }}>
        {/* アイコン */}
        <div
          className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex items-center justify-center font-black text-3xl flex-shrink-0"
          style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "2.5px solid var(--ink)" }}
        >
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name ?? "アイコン"} className="w-full h-full object-cover" />
          ) : (
            <span>{user.name?.[0]?.toUpperCase() ?? "U"}</span>
          )}
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl md:text-4xl leading-none mb-2" style={{ color: "var(--ink)" }}>
            {user.name ?? "匿名ユーザー"}
          </h1>
          {user.bio && (
            <p className="text-sm leading-relaxed mb-4 max-w-lg" style={{ color: "var(--ink-2)" }}>{user.bio}</p>
          )}

          {/* SNSバッジ */}
          {snsList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {snsList.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-75"
                  style={{ backgroundColor: "var(--bg-2)", color: s.color, border: "1.5px solid var(--border)" }}
                >
                  {s.icon}
                  {s.label}
                  <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                </a>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6">
            {[
              { num: user._count.posts, label: "投稿" },
              { num: completedCount, label: "完食" },
              { num: likesAgg, label: "いいね獲得" },
              ...(user._count.submittedStores > 0
                ? [{ num: user._count.submittedStores, label: "店舗発掘" }]
                : []),
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl md:text-3xl" style={{ color: "var(--ink)" }}>{num}</div>
                <div className="text-xs font-medium" style={{ color: "var(--ink-3)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 投稿一覧 */}
      <div className="mb-6">
        <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Posts</p>
        <h2 className="font-display text-3xl leading-none" style={{ color: "var(--ink)" }}>
          投稿一覧
          <span className="text-lg font-sans ml-3" style={{ color: "var(--ink-3)" }}>{user._count.posts}件</span>
        </h2>
      </div>

      {user.posts.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed var(--border)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mascot.png" alt="" className="w-16 h-16 object-contain mx-auto mb-3 opacity-40" />
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>まだ投稿がありません</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {user.posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
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
