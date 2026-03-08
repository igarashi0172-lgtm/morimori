"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Search } from "lucide-react";
import { GENRES, AREAS } from "@/lib/utils";

const TYPES = [
  { value: "info_change",  label: "情報変更依頼",        desc: "営業時間・電話番号・住所などの変更" },
  { value: "new_store",    label: "新規情報登録依頼",     desc: "まだ掲載されていない店舗の登録申請" },
  { value: "new_open",     label: "新規オープン掲載依頼", desc: "新しくオープンした大盛り店舗の掲載" },
  { value: "closed",       label: "閉店・休業の報告",     desc: "閉店・長期休業・移転などの報告" },
  { value: "other",        label: "その他のお問い合わせ", desc: "上記に当てはまらない内容" },
] as const;

type StoreHit = { id: string; name: string; area: string };

function InquiryForm() {
  const searchParams = useSearchParams();
  const preType   = searchParams.get("type") ?? "";
  const preStoreId = searchParams.get("storeId") ?? "";

  const [type, setType]           = useState(preType);
  const [body, setBody]           = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");

  // 既存店舗検索（変更・閉店）
  const [storeId, setStoreId]         = useState(preStoreId);
  const [storeName, setStoreName]     = useState("");
  const [storeQuery, setStoreQuery]   = useState("");
  const [storeResults, setStoreResults] = useState<StoreHit[]>([]);
  const [storeDropOpen, setStoreDropOpen] = useState(false);

  // 新規店舗情報フィールド
  const [newName, setNewName]           = useState("");
  const [newAddress, setNewAddress]     = useState("");
  const [newArea, setNewArea]           = useState("");
  const [newStation, setNewStation]     = useState("");
  const [newGenre, setNewGenre]         = useState("");
  const [newPhone, setNewPhone]         = useState("");
  const [newHours, setNewHours]         = useState("");
  const [newClosedDays, setNewClosedDays] = useState("");
  const [newImageUrl, setNewImageUrl]   = useState("");
  const [newDesc, setNewDesc]           = useState("");

  const needsExistingStore = ["info_change", "closed"].includes(type);
  const needsNewStore      = ["new_store", "new_open"].includes(type);

  useEffect(() => {
    if (!needsExistingStore || !storeQuery.trim()) { setStoreResults([]); return; }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/stores/search?q=${encodeURIComponent(storeQuery)}`);
      const d = await res.json();
      setStoreResults(d.stores ?? []);
    }, 300);
    return () => clearTimeout(t);
  }, [storeQuery, needsExistingStore]);

  useEffect(() => {
    if (!preStoreId) return;
    fetch(`/api/stores/search?id=${preStoreId}`)
      .then(r => r.json())
      .then(d => { if (d.store) setStoreName(d.store.name); });
  }, [preStoreId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!type) { setError("種別を選択してください"); return; }
    if (needsNewStore && !newName.trim()) { setError("店舗名を入力してください"); return; }
    if (needsNewStore && !newArea) { setError("エリアを選択してください"); return; }
    if (needsNewStore && !newGenre) { setError("ジャンルを選択してください"); return; }
    if (!needsNewStore && !body.trim()) { setError("内容を入力してください"); return; }
    setLoading(true);
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        storeName: needsNewStore ? newName : storeName,
        storeId:   needsExistingStore ? storeId : null,
        body:      needsNewStore ? (newDesc || "新規掲載依頼") : body,
        name:      contactName,
        email,
        storeAddress:    needsNewStore ? newAddress    : null,
        storeArea:       needsNewStore ? newArea       : null,
        storeStation:    needsNewStore ? newStation    : null,
        storeGenre:      needsNewStore ? newGenre      : null,
        storePhone:      needsNewStore ? newPhone      : null,
        storeHours:      needsNewStore ? newHours      : null,
        storeClosedDays: needsNewStore ? newClosedDays : null,
        storeImageUrl:   needsNewStore ? newImageUrl   : null,
        storeDesc:       needsNewStore ? newDesc       : null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "送信に失敗しました"); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <CheckCircle className="w-14 h-14 mx-auto mb-5" style={{ color: "var(--green)" }} />
        <h2 className="font-display text-4xl mb-3" style={{ color: "var(--ink)" }}>送信完了！</h2>
        <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--ink-2)" }}>
          お問い合わせありがとうございます。<br />内容を確認の上、順次対応いたします。
        </p>
        <a href="/" className="btn-primary">トップに戻る</a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <div className="mb-10">
        <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>Contact</p>
        <h1 className="font-display leading-none" style={{ fontSize: "clamp(2rem, 8vw, 4rem)", color: "var(--ink)" }}>お問い合わせ</h1>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--ink-2)" }}>
          店舗情報の追加・修正・閉店報告など、お気軽にお送りください。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="text-sm px-4 py-3 rounded-xl font-medium" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1.5px solid var(--red)" }}>
            {error}
          </div>
        )}

        {/* 種別 */}
        <div>
          <label className="label-base">お問い合わせの種別 <span style={{ color: "var(--red)" }}>*</span></label>
          <div className="grid grid-cols-1 gap-2">
            {TYPES.map(t => (
              <label
                key={t.value}
                className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-colors"
                style={{
                  border: `1.5px solid ${type === t.value ? "var(--ink)" : "var(--border)"}`,
                  backgroundColor: type === t.value ? "var(--pop-light)" : "var(--surface)",
                }}
              >
                <input
                  type="radio" name="type" value={t.value}
                  checked={type === t.value}
                  onChange={() => { setType(t.value); setStoreId(""); setStoreName(""); setStoreQuery(""); }}
                  className="mt-0.5 flex-shrink-0 accent-black"
                />
                <div>
                  <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>{t.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--ink-3)" }}>{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 既存店舗検索 */}
        {needsExistingStore && (
          <div>
            <label className="label-base">対象の店舗</label>
            {storeId && storeName ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "var(--pop-light)", border: "1.5px solid var(--ink)" }}>
                <span className="flex-1 font-bold text-sm" style={{ color: "var(--ink)" }}>{storeName}</span>
                <button type="button" onClick={() => { setStoreId(""); setStoreName(""); }} className="text-xs" style={{ color: "var(--ink-3)" }}>変更</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--ink-3)" }} />
                <input
                  value={storeQuery}
                  onChange={e => { setStoreQuery(e.target.value); setStoreDropOpen(true); }}
                  onFocus={() => setStoreDropOpen(true)}
                  className="input-base"
                  style={{ paddingLeft: "2.25rem" }}
                  placeholder="店名で検索…"
                />
                {storeDropOpen && storeResults.length > 0 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setStoreDropOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl z-20 overflow-hidden" style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-hover)" }}>
                      {storeResults.map(s => (
                        <button key={s.id} type="button" className="w-full text-left px-4 py-3 transition-colors hover-bg" style={{ borderBottom: "1px solid var(--border)" }}
                          onClick={() => { setStoreId(s.id); setStoreName(s.name); setStoreQuery(""); setStoreDropOpen(false); }}>
                          <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>{s.name}</div>
                          <div className="text-xs" style={{ color: "var(--ink-3)" }}>{s.area}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 新規店舗情報フォーム */}
        {needsNewStore && (
          <div className="space-y-4 p-5 rounded-2xl" style={{ backgroundColor: "var(--bg-2)", border: "1.5px solid var(--border)" }}>
            <p className="text-xs font-black tracking-wider uppercase" style={{ color: "var(--ink-3)" }}>店舗情報</p>

            <div>
              <label className="label-base">店舗名 <span style={{ color: "var(--red)" }}>*</span></label>
              <input value={newName} onChange={e => setNewName(e.target.value)} className="input-base" placeholder="例：大盛りラーメン 山田屋" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-base">エリア <span style={{ color: "var(--red)" }}>*</span></label>
                <select value={newArea} onChange={e => setNewArea(e.target.value)} className="input-base">
                  <option value="">選択してください</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="label-base">最寄駅</label>
                <input value={newStation} onChange={e => setNewStation(e.target.value)} className="input-base" placeholder="例：新宿（駅名のみ）" />
              </div>
            </div>

            <div>
              <label className="label-base">ジャンル <span style={{ color: "var(--red)" }}>*</span></label>
              <select value={newGenre} onChange={e => setNewGenre(e.target.value)} className="input-base">
                <option value="">選択してください</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="label-base">住所</label>
              <input value={newAddress} onChange={e => setNewAddress(e.target.value)} className="input-base" placeholder="例：東京都新宿区西新宿1-1-1" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-base">電話番号</label>
                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="input-base" placeholder="例：03-1234-5678" />
              </div>
              <div>
                <label className="label-base">定休日</label>
                <input value={newClosedDays} onChange={e => setNewClosedDays(e.target.value)} className="input-base" placeholder="例：月曜・火曜" />
              </div>
            </div>

            <div>
              <label className="label-base">営業時間</label>
              <input value={newHours} onChange={e => setNewHours(e.target.value)} className="input-base" placeholder="例：11:00〜22:00（L.O. 21:30）" />
            </div>

            <div>
              <label className="label-base">店舗画像URL（任意）</label>
              <input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="input-base" placeholder="https://..." />
            </div>

            <div>
              <label className="label-base">店舗説明・備考</label>
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={3} className="input-base resize-none" placeholder="大盛りメニューの特徴や、知っておくと便利な情報など" />
            </div>
          </div>
        )}

        {/* 変更・閉店・その他の内容 */}
        {!needsNewStore && type && (
          <div>
            <label className="label-base">内容 <span style={{ color: "var(--red)" }}>*</span></label>
            <textarea
              value={body} onChange={e => setBody(e.target.value)} rows={6} className="input-base resize-none"
              placeholder={
                type === "info_change" ? "例：電話番号が変わりました。正しくは 03-xxxx-xxxx です。" :
                type === "closed"      ? "例：○○店が先月閉店しました。" :
                "お問い合わせ内容をご記入ください"
              }
            />
          </div>
        )}

        {/* 送信者情報 */}
        {type && (
          <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: "var(--bg-2)", border: "1.5px solid var(--border)" }}>
            <p className="text-xs font-bold" style={{ color: "var(--ink-3)" }}>送信者情報（任意・返信が必要な場合はご記入ください）</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label-base">お名前</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} className="input-base" placeholder="田中 太郎" />
              </div>
              <div>
                <label className="label-base">メールアドレス</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-base" placeholder="example@email.com" />
              </div>
            </div>
          </div>
        )}

        {type && (
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            送信する
          </button>
        )}
      </form>
    </div>
  );
}

export default function InquiryPage() {
  return <Suspense><InquiryForm /></Suspense>;
}
