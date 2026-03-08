"use client";

import { useState, useRef, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, X, ImagePlus, Search, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";

type Store = { id: string; name: string; area: string; nearestStation: string | null };

function NewPostForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 店舗選択
  const [storeQuery, setStoreQuery] = useState("");
  const [storeResults, setStoreResults] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeDropOpen, setStoreDropOpen] = useState(false);
  const [storeSearching, setStoreSearching] = useState(false);

  // ファイルアップロード
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 初期店舗ID（URLパラメータから）
  useEffect(() => {
    const storeId = searchParams.get("storeId");
    if (storeId) {
      fetch(`/api/stores/search?id=${storeId}`)
        .then(r => r.json())
        .then(d => { if (d.store) setSelectedStore(d.store); });
    }
  }, [searchParams]);

  // 店舗インクリメンタル検索
  useEffect(() => {
    if (!storeQuery.trim()) { setStoreResults([]); return; }
    const t = setTimeout(async () => {
      setStoreSearching(true);
      try {
        const res = await fetch(`/api/stores/search?q=${encodeURIComponent(storeQuery)}`);
        const d = await res.json();
        setStoreResults(d.stores ?? []);
      } catch {
        setStoreResults([]);
      } finally {
        setStoreSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [storeQuery]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const next = [...files, ...picked].slice(0, 4);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
    e.target.value = "";
  }

  function removeFile(i: number) {
    const next = files.filter((_, idx) => idx !== i);
    setFiles(next);
    setPreviews(next.map(f => URL.createObjectURL(f)));
  }

  if (status === "loading") return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--ink-3)" }} />
    </div>
  );
  if (!session) { router.push("/login"); return null; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("タイトルを入力してください"); return; }
    if (title.length > 100) { setError("タイトルは100文字以内にしてください"); return; }
    if (body.length > 2000) { setError("本文は2000文字以内にしてください"); return; }
    setLoading(true);

    try {
      let mediaUrls: string[] = [];
      if (files.length > 0) {
        setUploading(true);
        const fd = new FormData();
        files.forEach(f => fd.append("files", f));
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        setUploading(false);
        if (!upRes.ok) { setError(upData.error ?? "アップロードに失敗しました"); setLoading(false); return; }
        mediaUrls = upData.urls;
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          storeId: selectedStore?.id ?? null,
          mediaUrls,
          isCompleted,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "投稿に失敗しました"); }
      else { router.push(`/posts/${data.post.id}?new=1`); }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <div className="mb-10">
        <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "var(--ink-3)" }}>New Post</p>
        <h1 className="font-display text-5xl" style={{ color: "var(--ink)" }}>投稿する</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm px-4 py-3 rounded-xl font-medium" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1.5px solid var(--red)" }}>
            {error}
          </div>
        )}

        {/* タイトル */}
        <div>
          <label className="label-base">タイトル <span style={{ color: "var(--red)" }}>*</span></label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={100}
            className="input-base"
            placeholder="例：大盛りつけ麺1kg完食！人生最大の量だった"
          />
          <div className="text-right text-xs mt-1" style={{ color: title.length > 90 ? "var(--red)" : "var(--ink-3)" }}>
            {title.length}/100
          </div>
        </div>

        {/* 店舗選択 */}
        <div>
          <label className="label-base">店舗（任意）</label>

          {selectedStore ? (
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ backgroundColor: "var(--pop-light)", border: "1.5px solid var(--ink)" }}
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>{selectedStore.name}</div>
                <div className="text-xs" style={{ color: "var(--ink-2)" }}>
                  {selectedStore.area}{selectedStore.nearestStation ? `・${selectedStore.nearestStation}駅` : ""}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStore(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--bg-2)", color: "var(--ink-2)" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
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
                {storeSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin" style={{ color: "var(--ink-3)" }} />
                )}
              </div>

              {storeDropOpen && storeResults.length > 0 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStoreDropOpen(false)} />
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl z-20 overflow-hidden"
                    style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-hover)" }}
                  >
                    {storeResults.map(s => (
                      <button
                        key={s.id}
                        type="button"
                        className="w-full text-left px-4 py-3 transition-colors hover-bg"
                        style={{ borderBottom: "1px solid var(--border)" }}
                        onClick={() => {
                          setSelectedStore(s);
                          setStoreQuery("");
                          setStoreDropOpen(false);
                        }}
                      >
                        <div className="font-bold text-sm" style={{ color: "var(--ink)" }}>{s.name}</div>
                        <div className="text-xs" style={{ color: "var(--ink-3)" }}>
                          {s.area}{s.nearestStation ? `・${s.nearestStation}駅` : ""}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {storeDropOpen && storeQuery.trim() && !storeSearching && storeResults.length === 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl z-20 px-4 py-3 text-sm"
                  style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", color: "var(--ink-3)" }}
                >
                  店舗が見つかりませんでした
                </div>
              )}
            </div>
          )}
        </div>

        {/* 画像・動画アップロード */}
        <div>
          <label className="label-base">画像・動画（最大4枚）</label>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-video rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--border)" }}>
                  {files[i]?.type.startsWith("video") ? (
                    <video src={src} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(24,22,15,0.7)", color: "#fff" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length < 4 && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl transition-colors"
                style={{
                  border: "2px dashed var(--border-2)",
                  color: "var(--ink-3)",
                  backgroundColor: "var(--bg-2)",
                }}
              >
                <ImagePlus className="w-6 h-6" />
                <span className="text-sm font-medium">タップして追加</span>
                <span className="text-xs">JPG・PNG・GIF・MP4・MOV 対応</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}
        </div>

        {/* 本文 */}
        <div>
          <label className="label-base">本文（任意）</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            className="input-base resize-none"
            placeholder="食べた感想、量の感想、おすすめポイントなど…"
          />
        </div>

        {/* 完食チェック */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
            style={{
              backgroundColor: isCompleted ? "var(--ink)" : "transparent",
              border: `2px solid ${isCompleted ? "var(--ink)" : "var(--border-2)"}`,
            }}
            onClick={() => setIsCompleted(!isCompleted)}
          >
            {isCompleted && (
              <svg className="w-3 h-3" style={{ color: "var(--pop)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>完食達成！</span>
        </label>

        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary w-full justify-center py-3.5 disabled:opacity-50"
        >
          {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {uploading ? "アップロード中…" : "投稿する"}
        </button>
      </form>
    </div>
  );
}

export default function NewPostPage() {
  return <Suspense><NewPostForm /></Suspense>;
}
