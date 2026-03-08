"use client";

import { useState } from "react";
import { EyeOff, Eye, Trash2, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  isCompleted: boolean;
  hidden: boolean;
  createdAt: string;
  user: { id: string; name: string | null };
  store: { id: string; name: string } | null;
  _count: { likes: number; comments: number };
};

export default function AdminPostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts]       = useState(initialPosts);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter]     = useState<"all" | "visible" | "hidden">("all");
  const [query, setQuery]       = useState("");

  async function toggleHidden(id: string, current: boolean) {
    setProcessing(id);
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, hidden: !current }),
    });
    if (res.ok) setPosts(prev => prev.map(p => p.id === id ? { ...p, hidden: !current } : p));
    setProcessing(null);
  }

  async function deletePost(id: string) {
    if (!confirm("この投稿を完全に削除しますか？元に戻せません。")) return;
    setProcessing(id);
    const res = await fetch("/api/admin/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== id));
    setProcessing(null);
  }

  const filtered = posts.filter(p => {
    const matchFilter =
      filter === "all"     ? true :
      filter === "visible" ? !p.hidden :
      p.hidden;
    const matchQuery = query.trim() === "" ? true :
      p.title.includes(query) || (p.user.name ?? "").includes(query) || (p.store?.name ?? "").includes(query);
    return matchFilter && matchQuery;
  });

  const hiddenCount = posts.filter(p => p.hidden).length;

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Admin</p>
          <h1 className="font-display text-4xl leading-none" style={{ color: "var(--ink)" }}>投稿管理</h1>
          <p className="text-sm mt-2" style={{ color: "var(--ink-3)" }}>
            全{posts.length}件
            {hiddenCount > 0 && <span className="ml-2" style={{ color: "var(--red)" }}>非表示 {hiddenCount}件</span>}
          </p>
        </div>
        <Link href="/admin/inquiries" className="btn-secondary text-sm">問い合わせ管理へ</Link>
      </div>

      {/* 検索＋フィルター */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="input-base flex-1"
          placeholder="タイトル・ユーザー名・店舗名で検索"
        />
        <div className="flex gap-2">
          {(["all", "visible", "hidden"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap"
              style={{ backgroundColor: filter === f ? "var(--ink)" : "var(--bg-2)", color: filter === f ? "var(--pop)" : "var(--ink-2)", border: "1.5px solid var(--border)" }}>
              {f === "all" ? "すべて" : f === "visible" ? "表示中" : "非表示"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-4xl mb-2" style={{ color: "var(--border-2)" }}>EMPTY</p>
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>該当する投稿がありません</p>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
          {filtered.map((post, i) => (
            <div
              key={post.id}
              className="flex items-center gap-3 px-5 py-3.5"
              style={{
                borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
                backgroundColor: post.hidden ? "var(--red-light)" : "var(--surface)",
                opacity: post.hidden ? 0.75 : 1,
              }}
            >
              {/* 非表示バッジ */}
              {post.hidden && (
                <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--red)", color: "#fff" }}>非表示</span>
              )}

              {/* タイトル・メタ */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm truncate" style={{ color: "var(--ink)" }}>{post.title}</span>
                  {post.isCompleted && <span className="tag tag-green flex-shrink-0">完食</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--ink-3)" }}>
                  {post.user.name ?? "匿名"}
                  {post.store && <span> · {post.store.name}</span>}
                  <span> · {formatDate(post.createdAt)}</span>
                  <span> · ❤ {post._count.likes}</span>
                </div>
              </div>

              {/* アクション */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Link href={`/posts/${post.id}`} target="_blank"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover-bg"
                  style={{ color: "var(--ink-3)" }} title="投稿を見る">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => toggleHidden(post.id, post.hidden)}
                  disabled={processing === post.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover-bg disabled:opacity-50"
                  style={{ color: post.hidden ? "var(--green)" : "var(--ink-2)" }}
                  title={post.hidden ? "表示に戻す" : "非表示にする"}
                >
                  {processing === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : post.hidden ? <Eye className="w-3.5 h-3.5" />
                    : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  disabled={processing === post.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover-bg disabled:opacity-50"
                  style={{ color: "var(--red)" }}
                  title="削除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
