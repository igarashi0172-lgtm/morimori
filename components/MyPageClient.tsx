"use client";

import { useState } from "react";
import ProfileEditModal from "@/components/ProfileEditModal";
import { Pencil, Instagram, Youtube, Twitter, ExternalLink } from "lucide-react";

type User = {
  name: string | null;
  bio: string | null;
  image: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  email: string;
  _count: { posts: number };
  posts: { isCompleted: boolean; _count: { likes: number } }[];
};

export default function MyPageClient({ user }: { user: User }) {
  const [editOpen, setEditOpen] = useState(false);
  const completedCount = user.posts.filter(p => p.isCompleted).length;
  const totalLikes = user.posts.reduce((sum, p) => sum + p._count.likes, 0);

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
    <>
      <div className="flex items-start gap-5 pb-10 mb-10 flex-wrap" style={{ borderBottom: "1.5px solid var(--border)" }}>
        {/* アイコン */}
        <div
          className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex items-center justify-center font-black text-2xl md:text-3xl flex-shrink-0"
          style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "2px solid var(--ink)" }}
        >
          {user.image ? (
            <img src={user.image} alt="icon" className="w-full h-full object-cover" />
          ) : (
            <span>{user.name?.[0]?.toUpperCase() ?? "U"}</span>
          )}
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="font-display text-3xl md:text-4xl leading-none" style={{ color: "var(--ink)" }}>
              {user.name ?? "匿名ユーザー"}
            </h1>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
              style={{ backgroundColor: "var(--bg-2)", color: "var(--ink-2)", border: "1.5px solid var(--border)" }}
            >
              <Pencil className="w-3 h-3" />
              編集
            </button>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--ink-3)" }}>{user.email}</p>
          {user.bio && <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--ink-2)" }}>{user.bio}</p>}

          {/* SNSバッジ */}
          {snsList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
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
          <div className="flex items-center gap-6">
            {[
              { num: user._count.posts, label: "投稿" },
              { num: completedCount, label: "完食" },
              { num: totalLikes, label: "いいね獲得" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="font-display text-2xl md:text-3xl" style={{ color: "var(--ink)" }}>{num}</div>
                <div className="text-xs font-medium" style={{ color: "var(--ink-3)" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editOpen && (
        <ProfileEditModal user={user} onClose={() => setEditOpen(false)} />
      )}
    </>
  );
}
