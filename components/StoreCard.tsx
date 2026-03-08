"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  store: {
    id: string;
    name: string;
    area: string;
    nearestStation: string | null;
    genre: string;
    imageUrl: string | null;
    description: string | null;
  };
  postCount: number;
};

export default function StoreCard({ store, postCount }: Props) {
  return (
    <motion.div
      whileHover={{ y: -4, rotate: -0.3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: "100%" }}
    >
      <Link
        href={`/stores/${store.id}`}
        className="card-base"
        style={{ display: "block", height: "100%", transform: "none" }}
      >
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: "var(--bg-2)" }}>
          {store.imageUrl ? (
            <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1" style={{ backgroundColor: "var(--bg-2)" }}>
              <span className="font-display text-5xl leading-none" style={{ color: "var(--border-2)" }}>
                {store.name[0]}
              </span>
              <span className="text-xs" style={{ color: "var(--border-2)" }}>NO PHOTO</span>
            </div>
          )}
          {/* Genre tag */}
          <div className="absolute top-3 left-3">
            <span className="tag tag-yellow">{store.genre}</span>
          </div>
          {/* Post count */}
          <div className="absolute top-3 right-3">
            <span
              className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(24,22,15,0.75)", color: "#fff" }}
            >
              {postCount}件
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-bold text-sm leading-snug mb-1.5" style={{ color: "var(--ink)" }}>
            {store.name}
          </h3>
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--ink-3)" }}>
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{store.area}{store.nearestStation ? `・${store.nearestStation}駅` : ""}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
