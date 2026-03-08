"use client";

import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

type Props = {
  post: {
    id: string;
    title: string;
    body: string | null;
    mediaUrls: string;
    isCompleted: boolean;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null };
    store: { id: string; name: string } | null;
    _count: { likes: number; comments: number };
  };
};

export default function PostCard({ post }: Props) {
  let images: string[] = [];
  try { images = JSON.parse(post.mediaUrls); } catch { images = []; }
  const firstImage = images[0];

  return (
    <motion.div
      whileHover={{ y: -4, rotate: 0.3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <Link
        href={`/posts/${post.id}`}
        className="card-base"
        style={{ display: "block", height: "100%", transform: "none" }}
      >
        {/* Image */}
        {firstImage && (
          <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: "var(--bg-2)" }}>
            <img src={firstImage} alt={post.title} className="w-full h-full object-cover" />
            {post.isCompleted && (
              <div className="absolute bottom-3 left-3">
                <span className="tag tag-green">完食！</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {!firstImage && post.isCompleted && (
            <span className="tag tag-green mb-3 inline-block">完食！</span>
          )}

          {/* User */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0"
              style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}
            >
              {post.user.name?.[0] ?? "U"}
            </div>
            <span className="text-xs font-medium truncate" style={{ color: "var(--ink-2)" }}>
              {post.user.name ?? "匿名"}
            </span>
            {post.store && (
              <span className="tag tag-outline ml-auto flex-shrink-0">{post.store.name}</span>
            )}
          </div>

          <h3 className="font-bold text-sm leading-snug mb-3 line-clamp-2" style={{ color: "var(--ink)" }}>
            {post.title}
          </h3>

          <div
            className="flex items-center gap-3 text-xs pt-3"
            style={{ borderTop: "1px solid var(--border)", color: "var(--ink-3)" }}
          >
            <span className="flex items-center gap-1 font-medium">
              <Heart className="w-3.5 h-3.5" style={{ color: "var(--red)" }} />
              {post._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              {post._count.comments}
            </span>
            <span className="ml-auto">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
