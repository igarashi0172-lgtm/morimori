import { prisma } from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import StoreCard from "@/components/StoreCard";
import PostCard from "@/components/PostCard";

export default async function RankingPage() {
  const [topStores, topPosts, topUsers, topTabehoudai, topSubmitters] = await Promise.all([
    prisma.store.findMany({ take: 10, include: { _count: { select: { posts: true } } }, orderBy: { posts: { _count: "desc" } } }),
    prisma.post.findMany({ take: 9, where: { hidden: false }, include: { user: true, store: true, _count: { select: { likes: true, comments: true } } }, orderBy: { likes: { _count: "desc" } } }),
    prisma.user.findMany({ take: 10, include: { _count: { select: { posts: true } } }, orderBy: { posts: { _count: "desc" } } }),
    prisma.store.findMany({
      where: { genre: "食べ放題" },
      take: 6,
      include: { _count: { select: { posts: true } } },
      orderBy: { posts: { _count: "desc" } },
    }),
    prisma.user.findMany({
      where: { submittedStores: { some: {} } },
      take: 10,
      include: { _count: { select: { submittedStores: true } } },
      orderBy: { submittedStores: { _count: "desc" } },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <div className="mb-12">
        <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Ranking</p>
        <h1 className="font-display leading-none" style={{ fontSize: "clamp(2rem, 7vw, 5rem)", color: "var(--ink)" }}>ランキング</h1>
      </div>

      {/* 全ジャンル 人気店舗 */}
      <section className="mb-16">
        <h2 className="font-display text-3xl mb-6" style={{ color: "var(--ink)" }}>人気店舗 TOP{Math.min(topStores.length, 10)}</h2>
        {topStores.length === 0 ? <p style={{ color: "var(--ink-3)" }}>データがまだありません</p> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-4">
              {topStores.slice(0, 3).map((store, i) => (
                <div key={store.id} className="relative">
                  <div
                    className="absolute -top-2.5 -left-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                    style={{
                      backgroundColor: i === 0 ? "#f5c800" : i === 1 ? "#c0c0c0" : "#cd7f32",
                      color: "var(--ink)",
                      border: "1.5px solid var(--ink)",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <StoreCard store={store} postCount={store._count.posts} />
                </div>
              ))}
            </div>
            {topStores.length > 3 && (
              <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
                {topStores.slice(3).map((store, i) => (
                  <Link key={store.id} href={`/stores/${store.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover-bg"
                    style={{ borderBottom: i < topStores.slice(3).length - 1 ? "1px solid var(--border)" : "none", backgroundColor: "var(--surface)", textDecoration: "none" }}
                  >
                    <span className="font-display text-xl w-6 text-center" style={{ color: "var(--ink-3)" }}>{i + 4}</span>
                    <span className="flex-1 text-sm font-bold" style={{ color: "var(--ink)" }}>{store.name}</span>
                    <span className="text-xs hidden sm:inline" style={{ color: "var(--ink-3)" }}>
                      {store.area}{store.nearestStation ? `・${store.nearestStation}駅` : ""}
                    </span>
                    <span className="tag tag-yellow">{store._count.posts}件</span>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--border-2)" }} />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* 食べ放題 人気ランキング */}
      <section className="mb-16 py-14 -mx-5 px-5" style={{ backgroundColor: "var(--pop)", borderTop: "1.5px solid var(--ink)", borderBottom: "1.5px solid var(--ink)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "rgba(24,22,15,0.5)" }}>
                All You Can Eat
              </p>
              <h2 className="font-display text-3xl leading-none" style={{ color: "var(--ink)" }}>食べ放題 人気ランキング</h2>
            </div>
            <Link
              href="/stores?genre=%E9%A3%9F%E3%81%B9%E6%94%BE%E9%A1%8C"
              className="text-sm font-bold flex items-center gap-1"
              style={{ color: "var(--ink-2)", textDecoration: "none" }}
            >
              もっと見る <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {topTabehoudai.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: "rgba(24,22,15,0.06)", border: "1.5px solid rgba(24,22,15,0.15)" }}>
              <p className="font-display text-4xl mb-2" style={{ color: "rgba(24,22,15,0.2)" }}>EMPTY</p>
              <p className="text-sm font-medium" style={{ color: "var(--ink-2)" }}>食べ放題のお店がまだ登録されていません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {topTabehoudai.map((store, i) => (
                <div key={store.id} className="relative">
                  {i < 3 && (
                    <div
                      className="absolute -top-2.5 -left-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
                      style={{
                        backgroundColor: i === 0 ? "#f5c800" : i === 1 ? "#c0c0c0" : "#cd7f32",
                        color: "var(--ink)",
                        border: "1.5px solid var(--ink)",
                        boxShadow: "var(--shadow-card)",
                      }}
                    >
                      {i + 1}
                    </div>
                  )}
                  <StoreCard store={store} postCount={store._count.posts} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Posts */}
      <section className="mb-16 py-14 -mx-5 px-5" style={{ backgroundColor: "var(--bg-2)", borderTop: "1.5px solid var(--border)", borderBottom: "1.5px solid var(--border)" }}>
        <h2 className="font-display text-3xl mb-6" style={{ color: "var(--ink)" }}>いいね数 人気投稿</h2>
        {topPosts.length === 0 ? <p style={{ color: "var(--ink-3)" }}>データがまだありません</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {topPosts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </section>

      {/* Users */}
      <section className="mb-16">
        <h2 className="font-display text-3xl mb-6" style={{ color: "var(--ink)" }}>投稿数ランキング</h2>
        {topUsers.length === 0 ? <p style={{ color: "var(--ink-3)" }}>データがまだありません</p> : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
            {topUsers.map((user, i) => (
              <Link key={user.id} href={`/users/${user.id}`}
                className="flex items-center gap-4 px-5 py-4 transition-colors hover-bg"
                style={{ borderBottom: i < topUsers.length - 1 ? "1px solid var(--border)" : "none", backgroundColor: "var(--surface)", textDecoration: "none" }}
              >
                <span
                  className="font-display text-2xl w-7 text-center flex-shrink-0"
                  style={{ color: i === 0 ? "#f5c800" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--ink-3)" }}
                >
                  {i + 1}
                </span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0" style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}>
                  {user.name?.[0] ?? "U"}
                </div>
                <span className="flex-1 font-bold text-sm" style={{ color: "var(--ink)" }}>{user.name ?? "匿名"}</span>
                <span className="tag tag-outline">{user._count.posts}投稿</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 店舗申請者ランキング */}
      <section>
        <div className="mb-6">
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Store Contributors</p>
          <h2 className="font-display text-3xl leading-none" style={{ color: "var(--ink)" }}>店舗発掘者ランキング</h2>
          <p className="text-sm mt-1" style={{ color: "var(--ink-3)" }}>店舗を申請して承認された数のランキング</p>
        </div>
        {topSubmitters.length === 0 ? (
          <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed var(--border)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="" className="w-20 h-20 object-contain mx-auto mb-3 opacity-40" />
            <p className="font-bold text-sm" style={{ color: "var(--ink-3)" }}>まだ承認された店舗申請がありません</p>
            <p className="text-xs mt-1" style={{ color: "var(--ink-3)" }}>新しいお店を見つけて申請してみよう！</p>
            <Link href="/inquiry?type=new_store" className="btn-primary mt-4 inline-flex">
              店舗を申請する
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
            {topSubmitters.map((user, i) => (
              <div
                key={user.id}
                className="flex items-center gap-4 px-5 py-4"
                style={{
                  borderBottom: i < topSubmitters.length - 1 ? "1px solid var(--border)" : "none",
                  backgroundColor: i === 0 ? "rgba(245,200,0,0.08)" : "var(--surface)",
                }}
              >
                <span
                  className="font-display text-2xl w-7 text-center flex-shrink-0"
                  style={{ color: i === 0 ? "#f5c800" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "var(--ink-3)" }}
                >
                  {i + 1}
                </span>
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name ?? ""} className="w-9 h-9 rounded-full object-cover flex-shrink-0" style={{ border: "1.5px solid var(--border)" }} />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0" style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}>
                    {user.name?.[0] ?? "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: "var(--ink)" }}>{user.name ?? "匿名"}</p>
                  {i === 0 && <p className="text-xs" style={{ color: "var(--ink-3)" }}>🏆 トップ発掘者</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="font-display text-xl" style={{ color: "var(--ink)" }}>{user._count.submittedStores}</span>
                  <span className="text-xs ml-1" style={{ color: "var(--ink-3)" }}>店舗</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
