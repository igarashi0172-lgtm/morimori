import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, Phone, Clock, Tag, ExternalLink } from "lucide-react";
import PostCard from "@/components/PostCard";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function StoreDetailPage({ params }: Props) {
  const { id } = await params;
  const store = await prisma.store.findUnique({
    where: { id },
    include: {
      menus: true,
      posts: {
        take: 9,
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        include: { user: true, store: true, _count: { select: { likes: true, comments: true } } },
      },
      _count: { select: { posts: true } },
    },
  });
  if (!store) notFound();

  const mapsQuery = encodeURIComponent(`${store.name} ${store.area}`);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(store.name + " " + store.area + " デカ盛り")}`;

  return (
    <div>
      {/* ヒーロー画像 or プレースホルダー */}
      <div className="w-full aspect-[21/9] overflow-hidden relative" style={{ backgroundColor: "var(--bg-2)" }}>
        {store.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(24,22,15,0.5) 0%, transparent 50%)" }} />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ backgroundColor: "var(--bg-2)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.png" alt="" className="w-16 h-16 object-contain opacity-20" />
            <p className="text-xs font-medium" style={{ color: "var(--ink-3)" }}>画像未登録</p>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="pb-8 mb-10" style={{ borderBottom: "1.5px solid var(--border)" }}>
          <div className="flex items-start gap-4 flex-col sm:flex-row sm:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="tag tag-yellow">{store.genre}</span>
                <span className="flex items-center gap-1 text-xs" style={{ color: "var(--ink-3)" }}>
                  <MapPin className="w-3 h-3" />{store.area}{store.nearestStation ? `・${store.nearestStation}駅` : ""}
                </span>
              </div>
              <h1 className="font-display leading-none mb-3" style={{ fontSize: "clamp(1.8rem, 6vw, 5rem)", color: "var(--ink)" }}>
                {store.name}
              </h1>
              {store.description && (
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--ink-2)" }}>{store.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-xs" style={{ color: "var(--ink-2)" }}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-2)", textDecoration: "none" }}
            >
              <MapPin className="w-3.5 h-3.5 opacity-50" />
              {store.address && store.address !== "東京都" ? store.address : `${store.area}${store.nearestStation ? `・${store.nearestStation}駅付近` : ""}`}
              <ExternalLink className="w-3 h-3 opacity-40" />
            </a>
            {store.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 opacity-50" />{store.phone}</span>}
            {store.hours && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-50" />{store.hours}</span>}
            {store.closedDays && <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 opacity-50" />定休日：{store.closedDays}</span>}
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color: "var(--ink-3)", textDecoration: "none" }}
            >
              <ExternalLink className="w-3 h-3" />
              Google で調べる
            </a>
          </div>
        </div>

        {/* Menus */}
        {store.menus.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-3xl mb-5" style={{ color: "var(--ink)" }}>大盛りメニュー</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {store.menus.map(menu => (
                <div key={menu.id} className="flex items-start gap-4 p-4 rounded-2xl" style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)" }}>
                  {menu.imageUrl && <img src={menu.imageUrl} alt={menu.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" style={{ border: "1.5px solid var(--border)" }} />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>{menu.name}</span>
                      {menu.isChallenge && <span className="tag tag-yellow">CHALLENGE</span>}
                    </div>
                    {menu.description && <p className="text-xs mt-1 line-clamp-2" style={{ color: "var(--ink-3)" }}>{menu.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Posts */}
        <section>
          <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
            <h2 className="font-display text-3xl" style={{ color: "var(--ink)" }}>みんなの投稿 {store._count.posts}件</h2>
            <div className="flex items-center gap-2">
              <Link
                href={`/inquiry?type=info_change&storeId=${store.id}`}
                className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                style={{ backgroundColor: "var(--bg-2)", color: "var(--ink-3)", border: "1.5px solid var(--border)" }}
              >
                情報が違う
              </Link>
              <Link href={`/posts/new?storeId=${store.id}`} className="btn-primary text-sm">ここで食べた！</Link>
            </div>
          </div>
          {store.posts.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ backgroundColor: "var(--bg-2)", border: "1.5px solid var(--border)" }}>
              <p className="font-display text-4xl mb-2" style={{ color: "var(--border-2)" }}>FIRST</p>
              <p className="text-sm" style={{ color: "var(--ink-3)" }}>最初の投稿者になろう！</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {store.posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
              {store._count.posts > 9 && (
                <div className="mt-8 text-center">
                  <Link
                    href={`/posts?storeId=${store.id}`}
                    className="btn-secondary"
                  >
                    残り{store._count.posts - 9}件を見る
                  </Link>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
