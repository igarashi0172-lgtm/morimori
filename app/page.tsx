import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PostCard from "@/components/PostCard";
import StoreCard from "@/components/StoreCard";
import { ArrowRight } from "lucide-react";
import { FadeIn, HeroText, StaggerChildren, StaggerItem, CountUp, ScrollReveal, ScaleIn } from "@/components/Anim";

export default async function Home() {
  const recentPosts = await prisma.post.findMany({
    take: 6,
    where: { hidden: false },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      store: true,
      _count: { select: { likes: true, comments: true } },
    },
  });

  const popularStores = await prisma.store.findMany({
    take: 6,
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });

  const [storeCount] = await Promise.all([
    prisma.store.count(),
  ]);

  return (
    <div>
      {/* ========== Hero ========== */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "var(--pop)", borderBottom: "1.5px solid var(--ink)" }}
      >
        {/* 背景の巨大テキスト */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          <span
            className="font-display leading-none"
            style={{
              fontSize: "52vw",
              color: "transparent",
              WebkitTextStroke: "2px rgba(24,22,15,0.08)",
              whiteSpace: "nowrap",
            }}
          >
            MORIMORI
          </span>
        </div>

        <div className="relative max-w-5xl mx-auto px-5 py-10 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:gap-10">

            {/* テキスト */}
            <div className="flex-1 min-w-0">
              {/* eyebrow */}
              <FadeIn delay={0.05}>
                <div
                  className="inline-block text-xs font-black tracking-[0.2em] uppercase px-3 py-1.5 rounded-full mb-5"
                  style={{ backgroundColor: "var(--ink)", color: "var(--pop)" }}
                >
                  大盛りグルメ専門コミュニティ
                </div>
              </FadeIn>

              {/* headline */}
              <h1
                className="font-display leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.4rem, 7vw, 7rem)", color: "var(--ink)" }}
              >
                <HeroText delay={0.15}>
                  <span className="block">お腹いっぱい</span>
                  <span className="block">になろう。</span>
                </HeroText>
              </h1>

              <FadeIn delay={0.45} y={12}>
                <p
                  className="text-sm md:text-base leading-relaxed mb-10 font-medium"
                  style={{ color: "var(--ink-2)", maxWidth: "26rem" }}
                >
                  大盛り・デカ盛り・チャレンジメニューに特化。<br />
                  あなたの完食体験をシェアしよう。
                </p>
              </FadeIn>

              <FadeIn delay={0.55} y={12}>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/stores" className="btn-primary">
                    店舗を探す <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/register" className="btn-secondary">
                    無料で始める
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* マスコット */}
            <ScaleIn delay={0.2} className="flex-shrink-0 flex justify-center mt-8 md:mt-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot.png"
                alt="MORIMORIマスコット"
                className="w-48 h-48 md:w-72 md:h-72 object-contain drop-shadow-xl"
                style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }}
              />
            </ScaleIn>

          </div>
        </div>
      </section>

      {/* ========== Stats bar ========== */}
      <div style={{ backgroundColor: "var(--ink)", borderBottom: "1.5px solid var(--ink)" }}>
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex justify-center">
            <div className="py-5 text-center px-10">
              <div className="font-display text-3xl md:text-4xl" style={{ color: "var(--pop)" }}>
                <CountUp target={storeCount} />
              </div>
              <div className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                掲載店舗
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== Popular Stores ========== */}
      {popularStores.length > 0 && (
        <section className="max-w-5xl mx-auto px-5 py-14">
          <ScrollReveal className="flex items-end justify-between mb-8">
            <div>
              <p
                className="text-xs font-black tracking-[0.2em] uppercase mb-1"
                style={{ color: "var(--ink-3)" }}
              >
                Popular Stores
              </p>
              <h2
                className="font-display leading-none"
                style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", color: "var(--ink)" }}
              >
                人気の大盛り店舗
              </h2>
            </div>
            <Link
              href="/stores"
              className="text-sm font-bold flex items-center gap-1"
              style={{ color: "var(--ink-2)", textDecoration: "none" }}
            >
              すべて見る <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularStores.map((store) => (
              <StaggerItem key={store.id}>
                <StoreCard store={store} postCount={store._count.posts} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        </section>
      )}

      {/* ========== Latest Posts ========== */}
      {recentPosts.length > 0 && (
        <section style={{ backgroundColor: "var(--bg-2)", borderTop: "1.5px solid var(--border)", borderBottom: "1.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-5 py-14">
            <ScrollReveal className="flex items-end justify-between mb-8">
              <div>
                <p
                  className="text-xs font-black tracking-[0.2em] uppercase mb-1"
                  style={{ color: "var(--ink-3)" }}
                >
                  Latest Posts
                </p>
                <h2
                  className="font-display leading-none"
                  style={{ fontSize: "clamp(1.8rem, 5vw, 3.5rem)", color: "var(--ink)" }}
                >
                  みんなの投稿
                </h2>
              </div>
              <Link
                href="/posts"
                className="text-sm font-bold flex items-center gap-1"
                style={{ color: "var(--ink-2)", textDecoration: "none" }}
              >
                すべて見る <ArrowRight className="w-4 h-4" />
              </Link>
            </ScrollReveal>
            <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentPosts.map((post) => (
                <StaggerItem key={post.id}>
                  <PostCard post={post} />
                </StaggerItem>
              ))}
            </StaggerChildren>
          </div>
        </section>
      )}

      {/* ========== CTA ========== */}
      <section className="max-w-5xl mx-auto px-5 py-16">
        <ScaleIn>
          <div
            className="rounded-2xl relative overflow-hidden"
            style={{
              backgroundColor: "var(--ink)",
              border: "1.5px solid var(--ink)",
              padding: "clamp(2.5rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)",
            }}
          >
            {/* 背景装飾テキスト */}
            <div
              aria-hidden
              className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none select-none overflow-hidden"
            >
              <span
                className="font-display leading-none"
                style={{ fontSize: "22vw", color: "var(--pop)", opacity: 0.08, whiteSpace: "nowrap" }}
              >
                JOIN
              </span>
            </div>

            <div className="relative max-w-lg">
              <p
                className="text-xs font-black tracking-[0.2em] uppercase mb-3"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Community
              </p>
              <h2
                className="font-display text-white mb-4 leading-none"
                style={{ fontSize: "clamp(2rem, 7vw, 5.5rem)" }}
              >
                大盛りを語ろう
              </h2>
              <p className="text-sm mb-8 font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                完食体験・チャレンジ記録・隠れた名店をシェア
              </p>
              <Link href="/register" className="btn-yellow">
                今すぐ無料で登録 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </ScaleIn>
      </section>
    </div>
  );
}
