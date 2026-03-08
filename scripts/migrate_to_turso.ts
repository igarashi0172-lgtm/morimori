import "dotenv/config";
import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "path";

const TURSO_URL = process.env["TURSO_DATABASE_URL"]!;
const TURSO_TOKEN = process.env["TURSO_AUTH_TOKEN"]!;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を .env に設定してください");
  process.exit(1);
}

const localDb = new Database(path.resolve(process.cwd(), "prisma/dev.db"));
const turso = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

async function migrate() {
  console.log("Tursoにスキーマを作成中...");

  // スキーマSQL取得（マイグレーションファイルから）
  const migrations = [
    "prisma/migrations/20260308085114_init/migration.sql",
    "prisma/migrations/20260308095215_add_nearest_station/migration.sql",
    "prisma/migrations/20260308095604_add_user_sns/migration.sql",
    "prisma/migrations/20260308100956_add_inquiry/migration.sql",
    "prisma/migrations/20260308101728_add_inquiry_store_fields_and_post_hidden/migration.sql",
    "prisma/migrations/20260308115641_add_submitted_by/migration.sql",
  ];

  const { readFile } = await import("fs/promises");
  for (const m of migrations) {
    const sql = await readFile(path.resolve(process.cwd(), m), "utf-8");
    const statements = sql.split(";").map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      try {
        await turso.execute(stmt);
      } catch {
        // 既存テーブルはスキップ
      }
    }
  }

  console.log("✅ スキーマ作成完了");

  // データ移行
  const tables = ["User", "Store", "Post", "Like", "Comment", "Inquiry", "Menu", "Account", "Session", "VerificationToken"];

  for (const table of tables) {
    const rows = localDb.prepare(`SELECT * FROM "${table}"`).all() as Record<string, unknown>[];
    if (rows.length === 0) {
      console.log(`  ${table}: スキップ（データなし）`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const placeholders = cols.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO "${table}" (${cols.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

    let count = 0;
    for (const row of rows) {
      try {
        await turso.execute({ sql, args: cols.map(c => row[c] as string | number | null) });
        count++;
      } catch (e) {
        // 重複等はスキップ
      }
    }
    console.log(`  ${table}: ${count}件 移行完了`);
  }

  console.log("\n🎉 全データ移行完了！");
  localDb.close();
}

migrate().catch(console.error);
