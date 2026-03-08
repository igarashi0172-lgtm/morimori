import { prisma } from "@/lib/prisma";
import StoreCard from "@/components/StoreCard";
import { GENRES, AREAS } from "@/lib/utils";

type Props = { searchParams: Promise<{ genre?: string; area?: string; q?: string }> };

export default async function StoresPage({ searchParams }: Props) {
  const { genre, area, q } = await searchParams;

  const stores = await prisma.store.findMany({
    where: {
      ...(genre ? { genre } : {}),
      ...(area ? { area } : {}),
      ...(q ? { name: { contains: q } } : {}),
    },
    include: { _count: { select: { posts: true } } },
    orderBy: { posts: { _count: "desc" } },
  });

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <div className="mb-10">
        <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>
          Stores
        </p>
        <h1 className="font-display leading-none" style={{ fontSize: "clamp(1.8rem, 6vw, 5rem)", color: "var(--ink)" }}>
          大盛り店舗を探す
        </h1>
      </div>

      {/* Filter */}
      <form
        className="p-4 rounded-2xl mb-8 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end"
        style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)" }}
      >
        <div className="flex-1 min-w-0 sm:min-w-44">
          <label className="label-base">キーワード</label>
          <input name="q" defaultValue={q} type="text" placeholder="店名で検索" className="input-base" />
        </div>
        <div className="sm:w-36">
          <label className="label-base">ジャンル</label>
          <select name="genre" defaultValue={genre ?? ""} className="input-base">
            <option value="">すべて</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="sm:w-36">
          <label className="label-base">エリア</label>
          <select name="area" defaultValue={area ?? ""} className="input-base">
            <option value="">すべて</option>
            {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex gap-2 sm:flex-col sm:gap-2">
          <button type="submit" className="btn-primary flex-1 sm:flex-none justify-center">絞り込む</button>
          {(genre || area || q) && <a href="/stores" className="btn-secondary flex-1 sm:flex-none justify-center">リセット</a>}
        </div>
      </form>

      <p className="text-sm mb-5 font-medium" style={{ color: "var(--ink-3)" }}>{stores.length}件</p>

      {stores.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-display text-6xl mb-3" style={{ color: "var(--border-2)" }}>EMPTY</p>
          <p style={{ color: "var(--ink-3)" }}>条件に合う店舗が見つかりませんでした</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stores.map(store => (
            <StoreCard key={store.id} store={store} postCount={store._count.posts} />
          ))}
        </div>
      )}
    </div>
  );
}
