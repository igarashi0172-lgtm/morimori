import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MORIMORI — 大盛りグルメ専門コミュニティ",
  description: "大盛り・デカ盛り・チャレンジメニューに特化したグルメコミュニティ。完食体験をシェアしよう。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Noto+Sans+JP:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: "var(--bg)", color: "var(--ink)" }}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <footer
            className="py-12 text-center"
            style={{ borderTop: "1.5px solid var(--border)" }}
          >
            <p
              className="font-display text-4xl mb-1"
              style={{ color: "var(--ink)" }}
            >
              MORI
              <span style={{ color: "var(--pop)", WebkitTextStroke: "1.5px var(--ink)" }}>
                MORI
              </span>
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--ink-3)" }}>
              量で選ぶ、量で語る。© 2026
            </p>
            <div className="flex items-center justify-center gap-5">
              <a href="/inquiry" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--ink-3)" }}>お問い合わせ</a>
              <span style={{ color: "var(--border-2)" }}>·</span>
              <a href="/inquiry?type=new_store" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--ink-3)" }}>店舗を登録する</a>
              <span style={{ color: "var(--border-2)" }}>·</span>
              <a href="/inquiry?type=closed" className="text-xs font-medium hover:underline underline-offset-2" style={{ color: "var(--ink-3)" }}>閉店を報告する</a>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
