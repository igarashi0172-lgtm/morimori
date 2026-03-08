"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, PenLine, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--surface)",
        borderBottom: "1.5px solid var(--border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center" style={{ textDecoration: "none" }}>
          <span
            className="font-display text-3xl leading-none"
            style={{ color: "var(--ink)" }}
          >
            MORI
          </span>
          <span
            className="font-display text-3xl leading-none"
            style={{
              color: "var(--pop)",
              WebkitTextStroke: "1.5px var(--ink)",
            }}
          >
            MORI
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/stores" className="nav-link">店舗を探す</Link>
          <Link href="/ranking" className="nav-link">ランキング</Link>
          <Link href="/inquiry" className="nav-link">お問い合わせ</Link>

          <div className="w-px h-5 mx-2" style={{ backgroundColor: "var(--border)" }} />

          {session ? (
            <>
              <Link href="/posts/new" className="btn-primary text-sm">
                <PenLine className="w-3.5 h-3.5" />
                投稿する
              </Link>
              <div className="relative ml-1">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-full transition-colors"
                  style={{ border: "1.5px solid var(--border)" }}
                  aria-label="ユーザーメニュー"
                  aria-expanded={userMenuOpen}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ backgroundColor: "var(--pop)", color: "var(--ink)", border: "1.5px solid var(--ink)" }}
                  >
                    {session.user?.name?.[0] ?? "U"}
                  </div>
                </button>
                <AnimatePresence>
                    {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-11 w-44 rounded-xl z-20 py-1 overflow-hidden"
                      style={{ backgroundColor: "var(--surface)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-hover)" }}
                    >
                      <div className="px-4 py-2.5" style={{ borderBottom: "1px solid var(--border)" }}>
                        <p className="text-xs font-bold truncate" style={{ color: "var(--ink-2)" }}>{session.user?.name}</p>
                      </div>
                      <Link
                        href="/mypage"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: "var(--ink)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-2)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <User className="w-3.5 h-3.5" /> マイページ
                      </Link>
                      <button
                        onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-left transition-colors"
                        style={{ color: "var(--ink-2)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-2)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <LogOut className="w-3.5 h-3.5" /> ログアウト
                      </button>
                    </motion.div>
                  </>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="nav-link">ログイン</Link>
              <Link href="/register" className="btn-yellow text-sm">登録する</Link>
            </div>
          )}
        </div>

        {/* Mobile */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: "var(--ink-2)" }}
          onClick={() => setOpen(!open)}
          aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={open}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="md:hidden border-t px-5 py-4 flex flex-col gap-1" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
              <Link href="/stores" onClick={() => setOpen(false)} className="nav-link">店舗を探す</Link>
              <Link href="/ranking" onClick={() => setOpen(false)} className="nav-link">ランキング</Link>
              <Link href="/inquiry" onClick={() => setOpen(false)} className="nav-link">お問い合わせ</Link>
              <div className="my-2" style={{ borderTop: "1px solid var(--border)" }} />
              {session ? (
                <>
                  <Link href="/posts/new" onClick={() => setOpen(false)} className="btn-primary text-sm justify-center mt-1">
                    <PenLine className="w-3.5 h-3.5" />投稿する
                  </Link>
                  <Link href="/mypage" onClick={() => setOpen(false)} className="nav-link">マイページ</Link>
                  <button onClick={() => { signOut(); setOpen(false); }} className="nav-link text-left" style={{ color: "var(--ink-2)" }}>ログアウト</button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)} className="nav-link">ログイン</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-yellow text-sm justify-center mt-1">新規登録</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
