"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = { postId: string; initialCount: number; initialLiked: boolean };

export default function LikeButton({ postId, initialCount, initialLiked }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!session) { router.push("/login"); return; }
    if (loading) return;
    setLoading(true);
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    if (!res.ok) { setLiked(liked); setCount(count); }
    setLoading(false);
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-full"
      style={{
        backgroundColor: liked ? "var(--red)" : "transparent",
        color: liked ? "#fff" : "var(--ink-2)",
        border: `1.5px solid ${liked ? "var(--red)" : "var(--border-2)"}`,
      }}
    >
      <Heart className="w-4 h-4" style={{ fill: liked ? "#fff" : "none" }} />
      {count}
      <span className="text-xs opacity-70">いいね</span>
    </button>
  );
}
