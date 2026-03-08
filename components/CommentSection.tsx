"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { Loader2, ArrowUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Comment = {
  id: string; body: string; createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
};

type Props = { postId: string; comments: Comment[]; currentUserId?: string };

export default function CommentSection({ postId, comments: initial, currentUserId }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initial);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments([...comments, data.comment]);
      setBody("");
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 className="font-display text-3xl mb-6" style={{ color: "var(--ink)" }}>
        コメント {comments.length > 0 && `(${comments.length})`}
      </h2>

      {comments.length > 0 && (
        <div className="space-y-4 mb-6">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}
              >
                {c.user.name?.[0] ?? "U"}
              </div>
              <div className="flex-1 p-3.5 rounded-2xl rounded-tl-sm" style={{ backgroundColor: "var(--bg-2)", border: "1.5px solid var(--border)" }}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm font-bold" style={{ color: "var(--ink)" }}>{c.user.name ?? "匿名"}</span>
                  <span className="text-xs" style={{ color: "var(--ink-3)" }}>{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm" style={{ color: "var(--ink-2)" }}>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-1"
            style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}
          >
            {session.user?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 relative">
            <input
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="コメントを書く..."
              className="input-base pr-12"
            />
            <button
              type="submit"
              disabled={loading || !body.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ backgroundColor: "var(--ink)", color: "var(--pop)" }}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </form>
      ) : (
        <div className="py-4 px-5 rounded-2xl text-sm text-center" style={{ backgroundColor: "var(--bg-2)", border: "1.5px solid var(--border)" }}>
          <Link href="/login" style={{ color: "var(--red)", fontWeight: 700 }}>ログイン</Link>
          <span style={{ color: "var(--ink-2)" }}>するとコメントできます</span>
        </div>
      )}
    </div>
  );
}
