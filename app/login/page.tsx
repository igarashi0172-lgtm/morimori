"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("メールアドレスまたはパスワードが間違っています"); }
    else { router.push("/"); router.refresh(); }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-display text-5xl leading-none mb-1" style={{ color: "var(--ink)" }}>
            MORI<span style={{ color: "var(--pop)", WebkitTextStroke: "1.5px var(--ink)" }}>MORI</span>
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--ink-3)" }}>大盛りグルメ専門コミュニティ</p>
        </div>

        <h1 className="font-display text-4xl mb-8 text-center" style={{ color: "var(--ink)" }}>ログイン</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl font-medium text-center" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1.5px solid var(--red)" }}>
              {error}
            </div>
          )}
          <div>
            <label className="label-base">メールアドレス</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-base" placeholder="example@email.com" />
          </div>
          <div>
            <label className="label-base">パスワード</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input-base" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            ログイン
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--ink-3)" }}>
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>新規登録</Link>
        </p>
      </div>
    </div>
  );
}
