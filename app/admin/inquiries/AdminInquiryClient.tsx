"use client";

import { useState } from "react";
import { CheckCircle, Circle, Loader2, Store, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type Inquiry = {
  id: string;
  type: string;
  storeName: string | null;
  storeId: string | null;
  body: string;
  name: string | null;
  email: string | null;
  status: string;
  createdAt: string;
  storeAddress: string | null;
  storeArea: string | null;
  storeStation: string | null;
  storeGenre: string | null;
  storePhone: string | null;
  storeHours: string | null;
  storeClosedDays: string | null;
  storeImageUrl: string | null;
  storeDesc: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  info_change: "情報変更",
  new_store:   "新規登録",
  new_open:    "新規オープン",
  closed:      "閉店報告",
  other:       "その他",
};

const TYPE_BG: Record<string, string> = {
  info_change: "#5c5446",
  new_store:   "var(--green)",
  new_open:    "var(--green)",
  closed:      "var(--red)",
  other:       "var(--ink-3)",
};

export default function AdminInquiryClient({ initialItems }: { initialItems: Inquiry[] }) {
  const [items, setItems]       = useState(initialItems);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter]     = useState<"all" | "open" | "done">("open");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);
  const [registered, setRegistered]   = useState<Record<string, string>>({}); // inquiryId -> storeId

  async function toggleStatus(id: string, current: string) {
    setUpdating(id);
    const next = current === "open" ? "done" : "open";
    const res = await fetch("/api/inquiry", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    if (res.ok) setItems(prev => prev.map(i => i.id === id ? { ...i, status: next } : i));
    setUpdating(null);
  }

  async function registerStore(inquiry: Inquiry) {
    setRegistering(inquiry.id);
    const res = await fetch("/api/admin/register-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inquiryId: inquiry.id }),
    });
    const data = await res.json();
    setRegistering(null);
    if (res.ok) {
      setRegistered(prev => ({ ...prev, [inquiry.id]: data.store.id }));
      setItems(prev => prev.map(i => i.id === inquiry.id ? { ...i, status: "done" } : i));
    } else {
      alert(data.error ?? "登録に失敗しました");
    }
  }

  const filtered  = items.filter(i => filter === "all" ? true : i.status === filter);
  const openCount = items.filter(i => i.status === "open").length;
  const isNewStore = (type: string) => type === "new_store" || type === "new_open";

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Admin</p>
          <h1 className="font-display text-4xl leading-none" style={{ color: "var(--ink)" }}>問い合わせ管理</h1>
          {openCount > 0 && (
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-black" style={{ backgroundColor: "var(--pop)", border: "1.5px solid var(--ink)" }}>
              未対応 {openCount}件
            </div>
          )}
        </div>
        <Link href="/admin/posts" className="btn-secondary text-sm">投稿管理へ</Link>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-6">
        {(["open", "done", "all"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
            style={{ backgroundColor: filter === f ? "var(--ink)" : "var(--bg-2)", color: filter === f ? "var(--pop)" : "var(--ink-2)", border: "1.5px solid var(--border)" }}>
            {f === "open" ? "未対応" : f === "done" ? "対応済み" : "すべて"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-4xl mb-2" style={{ color: "var(--border-2)" }}>ALL DONE</p>
          <p className="text-sm" style={{ color: "var(--ink-3)" }}>未対応の問い合わせはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="rounded-2xl overflow-hidden"
              style={{ border: `1.5px solid ${item.status === "done" ? "var(--border)" : "var(--ink)"}`, opacity: item.status === "done" ? 0.65 : 1 }}>

              {/* メインエリア */}
              <div className="p-5" style={{ backgroundColor: item.status === "done" ? "var(--bg-2)" : "var(--surface)" }}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleStatus(item.id, item.status)} disabled={updating === item.id} className="mt-0.5 flex-shrink-0">
                    {updating === item.id ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--ink-3)" }} />
                      : item.status === "done" ? <CheckCircle className="w-5 h-5" style={{ color: "var(--green)" }} />
                      : <Circle className="w-5 h-5" style={{ color: "var(--border-2)" }} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: TYPE_BG[item.type] ?? "var(--ink)" }}>
                        {TYPE_LABELS[item.type] ?? item.type}
                      </span>
                      {item.storeName && <span className="text-xs font-bold" style={{ color: "var(--ink-2)" }}>📍{item.storeName}</span>}
                      <span className="text-xs ml-auto" style={{ color: "var(--ink-3)" }}>
                        {new Date(item.createdAt).toLocaleDateString("ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {!isNewStore(item.type) && (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: "var(--ink)" }}>{item.body}</p>
                    )}

                    {(item.name || item.email) && (
                      <div className="flex items-center gap-3 text-xs mb-2" style={{ color: "var(--ink-3)" }}>
                        {item.name && <span>👤 {item.name}</span>}
                        {item.email && <a href={`mailto:${item.email}`} className="underline underline-offset-2" style={{ color: "var(--ink-2)" }}>✉ {item.email}</a>}
                      </div>
                    )}

                    {/* 新規店舗アクション */}
                    {isNewStore(item.type) && (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <button
                          onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                          className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: "var(--bg-2)", border: "1.5px solid var(--border)", color: "var(--ink-2)" }}
                        >
                          {expanded === item.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          店舗情報を確認
                        </button>

                        {registered[item.id] ? (
                          <Link href={`/stores/${registered[item.id]}`}
                            className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: "var(--green-light)", color: "var(--green)", border: "1.5px solid var(--green)" }}>
                            <CheckCircle className="w-3.5 h-3.5" /> 登録済み・店舗を見る
                          </Link>
                        ) : (
                          <button
                            onClick={() => registerStore(item)}
                            disabled={registering === item.id}
                            className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full disabled:opacity-50"
                            style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}>
                            {registering === item.id
                              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> 登録中…</>
                              : <><Store className="w-3.5 h-3.5" /> 店舗として登録</>}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 店舗情報展開 */}
              {isNewStore(item.type) && expanded === item.id && (
                <div className="px-5 pb-5 pt-0" style={{ backgroundColor: item.status === "done" ? "var(--bg-2)" : "var(--surface)", borderTop: "1px solid var(--border)" }}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs pt-4" style={{ color: "var(--ink-2)" }}>
                    {[
                      ["エリア", item.storeArea],
                      ["最寄駅", item.storeStation ? `${item.storeStation}駅` : null],
                      ["ジャンル", item.storeGenre],
                      ["住所", item.storeAddress],
                      ["電話", item.storePhone],
                      ["営業時間", item.storeHours],
                      ["定休日", item.storeClosedDays],
                    ].filter(([, v]) => v).map(([k, v]) => (
                      <div key={k as string}>
                        <span className="font-bold" style={{ color: "var(--ink-3)" }}>{k}：</span>{v}
                      </div>
                    ))}
                    {item.storeDesc && (
                      <div className="col-span-2 mt-1">
                        <span className="font-bold" style={{ color: "var(--ink-3)" }}>備考：</span>{item.storeDesc}
                      </div>
                    )}
                    {item.storeImageUrl && (
                      <div className="col-span-2 mt-2">
                        <img src={item.storeImageUrl} alt="店舗" className="w-32 h-20 object-cover rounded-lg" style={{ border: "1px solid var(--border)" }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
