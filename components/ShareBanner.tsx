"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { X, PartyPopper } from "lucide-react";

type Props = {
  postId: string;
  title: string;
  storeName: string | null;
  isCompleted: boolean;
};

export default function ShareBanner({ postId, title, storeName, isCompleted }: Props) {
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const [dismissed, setDismissed] = useState(false);

  if (!isNew || dismissed) return null;

  const shareText = [
    isCompleted ? "【完食達成！】" : "【大盛り記録】",
    title,
    storeName ? `📍${storeName}` : "",
    "",
    "#MORIMORI #大盛りグルメ",
    `https://morimori.jp/posts/${postId}`,
  ].filter(Boolean).join("\n");

  return (
    <div
      className="rounded-2xl p-5 mb-8 relative"
      style={{
        backgroundColor: "var(--pop)",
        border: "1.5px solid var(--ink)",
        boxShadow: "var(--shadow-hover)",
      }}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "rgba(24,22,15,0.1)", color: "var(--ink)" }}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <PartyPopper className="w-5 h-5" style={{ color: "var(--ink)" }} />
        <span className="font-black text-sm" style={{ color: "var(--ink)" }}>
          投稿完了！みんなにシェアしよう
        </span>
      </div>

      <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--ink-2)" }}>
        Xに投稿して大食い仲間に広めよう。テキストは自動で入力されます。
      </p>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-black px-5 py-2.5 rounded-full"
        style={{
          backgroundColor: "var(--ink)",
          color: "var(--pop)",
          textDecoration: "none",
          border: "1.5px solid var(--ink)",
          boxShadow: "0 3px 0 rgba(24,22,15,0.4)",
        }}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Xでシェアする
      </a>
    </div>
  );
}
