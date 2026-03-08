"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "登録に失敗しました"); } else { router.push("/login"); }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-5xl leading-none mb-1" style={{ color: "var(--ink)" }}>
            MORI<span style={{ color: "var(--pop)", WebkitTextStroke: "1.5px var(--ink)" }}>MORI</span>
          </p>
          <p className="text-xs font-medium" style={{ color: "var(--ink-3)" }}>大盛りグルメ専門コミュニティ</p>
        </div>

        <h1 className="font-display text-4xl mb-8 text-center" style={{ color: "var(--ink)" }}>新規登録</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl font-medium text-center" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1.5px solid var(--red)" }}>
              {error}
            </div>
          )}
          {[
            { label: "ニックネーム", type: "text", value: name, setter: setName, placeholder: "大盛り太郎" },
            { label: "メールアドレス", type: "email", value: email, setter: setEmail, placeholder: "example@email.com" },
            { label: "パスワード（8文字以上）", type: "password", value: password, setter: setPassword, placeholder: "••••••••" },
          ].map(({ label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label className="label-base">{label}</label>
              <input type={type} value={value} onChange={e => setter(e.target.value)} required className="input-base" placeholder={placeholder} />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            登録する
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--ink-3)" }}>
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-bold underline underline-offset-2" style={{ color: "var(--ink)" }}>ログイン</Link>
        </p>
      </div>
    </div>
  );
}
