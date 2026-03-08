import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  // 本番環境(Turso)とローカル(SQLite)を自動切り替え
  const tursoUrl = process.env["TURSO_DATABASE_URL"];
  const tursoToken = process.env["TURSO_AUTH_TOKEN"];

  if (tursoUrl && tursoToken) {
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    return new PrismaClient({ adapter });
  }

  // ローカル開発はSQLiteを使用
  const dbPath =
    process.env["DATABASE_URL"]?.replace("file:", "") ?? "./prisma/dev.db";
  const resolvedPath = path.isAbsolute(dbPath)
    ? dbPath
    : path.resolve(process.cwd(), "prisma", "dev.db");

  const adapter = new PrismaBetterSqlite3({ url: `file:${resolvedPath}` });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
