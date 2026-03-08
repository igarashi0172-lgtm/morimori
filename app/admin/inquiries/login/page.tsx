"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    router.push(`/admin/inquiries?key=${encodeURIComponent(key)}`);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="font-display text-5xl leading-none mb-1" style={{ color: "var(--ink)" }}>
            MORI<span style={{ color: "var(--pop)", WebkitTextStroke: "1.5px var(--ink)" }}>MORI</span>
          </p>
          <p className="text-xs font-medium mt-1" style={{ color: "var(--ink-3)" }}>管理者ページ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm px-4 py-3 rounded-xl font-medium text-center" style={{ backgroundColor: "var(--red-light)", color: "var(--red)", border: "1.5px solid var(--red)" }}>
              {error}
            </div>
          )}
          <div>
            <label className="label-base">管理者キー</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              required
              className="input-base"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 disabled:opacity-50">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}
