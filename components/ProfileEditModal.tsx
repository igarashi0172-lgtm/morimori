"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Camera, Instagram, Youtube, Twitter } from "lucide-react";

type User = {
  name: string | null;
  bio: string | null;
  image: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
};

type Props = { user: User; onClose: () => void };

export default function ProfileEditModal({ user, onClose }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [image, setImage] = useState(user.image ?? "");
  const [instagram, setInstagram] = useState(user.instagram ?? "");
  const [tiktok, setTiktok] = useState(user.tiktok ?? "");
  const [youtube, setYoutube] = useState(user.youtube ?? "");
  const [twitter, setTwitter] = useState(user.twitter ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("files", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setImage(data.urls[0]);
    else setError(data.error ?? "アップロードに失敗しました");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, bio, image, instagram, tiktok, youtube, twitter }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error ?? "保存に失敗しました"); return; }
    router.refresh();
    onClose();
  }

  const initials = (name || user.name)?.[0]?.toUpperCase() ?? "U";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(24,22,15,0.6)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-y-auto"
        style={{
          backgroundColor: "var(--surface)",
          border: "1.5px solid var(--border)",
          maxHeight: "92dvh",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1.5px solid var(--border)" }}>
          <h2 className="font-display text-2xl" style={{ color: "var(--ink)" }}>プロフィール編集</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: "var(--bg-2)", color: "var(--ink-2)" }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="px-6 py-6 space-y-5">
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl font-medium" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1.5px solid var(--red)" }}>
              {error}
            </div>
          )}

          {/* アイコン */}
          <div className="flex justify-center">
            <div className="relative">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-black text-3xl relative group"
                style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "2px solid var(--ink)" }}
              >
                {image ? (
                  <img src={image} alt="icon" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: "rgba(24,22,15,0.5)" }}>
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
            </div>
          </div>

          {/* 名前 */}
          <div>
            <label className="label-base">表示名</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-base" placeholder="ニックネームを入力" />
          </div>

          {/* bio */}
          <div>
            <label className="label-base">自己紹介</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="input-base resize-none" placeholder="大食い系YouTuberです。週3で食べ歩いています" />
          </div>

          {/* SNS */}
          <div>
            <label className="label-base">SNSリンク</label>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 flex-shrink-0" style={{ color: "#E1306C" }} />
                <input value={instagram} onChange={e => setInstagram(e.target.value)} className="input-base" placeholder="Instagram ユーザー名（@なし）" />
              </div>
              <div className="flex items-center gap-2">
                {/* TikTok icon */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" style={{ color: "#010101" }}>
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.28 8.28 0 0 0 4.84 1.55V6.82a4.85 4.85 0 0 1-1.07-.13z"/>
                </svg>
                <input value={tiktok} onChange={e => setTiktok(e.target.value)} className="input-base" placeholder="TikTok ユーザー名（@なし）" />
              </div>
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 flex-shrink-0" style={{ color: "#FF0000" }} />
                <input value={youtube} onChange={e => setYoutube(e.target.value)} className="input-base" placeholder="YouTube チャンネルURL または @ハンドル" />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-4 h-4 flex-shrink-0" style={{ color: "#1DA1F2" }} />
                <input value={twitter} onChange={e => setTwitter(e.target.value)} className="input-base" placeholder="X(Twitter) ユーザー名（@なし）" />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">キャンセル</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              保存する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
