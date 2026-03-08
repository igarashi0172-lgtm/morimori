import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";
dotenv.config();

const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash("password123", 12);
  const user1 = await prisma.user.upsert({
    where: { email: "taro@example.com" },
    update: {},
    create: { name: "大盛り太郎", email: "taro@example.com", passwordHash: hash, bio: "大盛りグルメ歴10年。完食率99%。" },
  });
  const user2 = await prisma.user.upsert({
    where: { email: "hanako@example.com" },
    update: {},
    create: { name: "爆食はなこ", email: "hanako@example.com", passwordHash: hash, bio: "チャレンジメニュー大好き！" },
  });

  const store1 = await prisma.store.upsert({
    where: { id: "store-1" },
    update: {},
    create: {
      id: "store-1",
      name: "ラーメン大盛軒",
      address: "東京都新宿区1-1-1",
      area: "東京",
      genre: "ラーメン",
      description: "新宿の名物大盛りラーメン店。特大ラーメンは麺2kg！",
      hours: "11:00〜24:00",
      closedDays: "月曜日",
      phone: "03-1234-5678",
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    },
  });
  await prisma.store.upsert({
    where: { id: "store-2" },
    update: {},
    create: {
      id: "store-2",
      name: "がっつり定食 山盛亭",
      address: "大阪府大阪市中央区2-2-2",
      area: "大阪",
      genre: "定食・丼",
      description: "大阪の大盛り定食専門店。ご飯おかわり無料！",
      hours: "10:00〜22:00",
      closedDays: "なし",
      phone: "06-2345-6789",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    },
  });
  const store3 = await prisma.store.upsert({
    where: { id: "store-3" },
    update: {},
    create: {
      id: "store-3",
      name: "爆盛りカレー キングスパイス",
      address: "東京都渋谷区3-3-3",
      area: "東京",
      genre: "カレー",
      description: "辛さと量で勝負。5kgカレーチャレンジあり！",
      hours: "11:00〜23:00",
      closedDays: "水曜日",
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    },
  });
  await prisma.store.upsert({
    where: { id: "store-4" },
    update: {},
    create: {
      id: "store-4",
      name: "デカ盛り焼肉 牛王",
      address: "福岡県福岡市博多区4-4-4",
      area: "九州・沖縄",
      genre: "焼肉・ステーキ",
      description: "1kgステーキチャレンジが名物！完食で無料！",
      hours: "17:00〜翌2:00",
      closedDays: "火曜日",
      imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80",
    },
  });

  const menuData = [
    { id: "menu-1", storeId: "store-1", name: "特大ラーメン", price: 1500, description: "麺2kg、チャーシュー10枚", isChallenge: true },
    { id: "menu-2", storeId: "store-1", name: "大盛りラーメン", price: 1000, description: "通常の3倍量", isChallenge: false },
    { id: "menu-3", storeId: "store-2", name: "山盛り定食", price: 900, description: "ご飯1kg、おかず大盛り", isChallenge: false },
    { id: "menu-4", storeId: "store-3", name: "5kgカレーチャレンジ", price: 3000, description: "制限時間30分。完食無料！", isChallenge: true },
    { id: "menu-5", storeId: "store-4", name: "1kgステーキ", price: 4000, description: "完食で無料！", isChallenge: true },
  ];
  for (const m of menuData) {
    await prisma.menu.upsert({ where: { id: m.id }, update: {}, create: m });
  }

  await prisma.post.upsert({
    where: { id: "post-1" },
    update: {},
    create: {
      id: "post-1",
      userId: user1.id,
      storeId: "store-1",
      title: "特大ラーメン完食！人生で一番お腹いっぱい",
      body: "新宿の大盛軒で特大ラーメンに挑戦！麺2kgというえげつない量でしたが、スープが絶品で気づいたら完食してました。チャーシューも10枚あって食べ応え抜群。次はもっとゆっくり食べたい。",
      mediaUrls: JSON.stringify(["https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80"]),
      isCompleted: true,
    },
  });
  await prisma.post.upsert({
    where: { id: "post-2" },
    update: {},
    create: {
      id: "post-2",
      userId: user2.id,
      storeId: "store-3",
      title: "5kgカレーチャレンジ撃沈...でも美味しかった",
      body: "キングスパイスの5kgカレーに挑戦したけど3.5kgで撃沈。でも本当に美味しくて悔しい。リベンジ誓います！",
      mediaUrls: JSON.stringify(["https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80"]),
      isCompleted: false,
    },
  });
  await prisma.post.upsert({
    where: { id: "post-3" },
    update: {},
    create: {
      id: "post-3",
      userId: user1.id,
      storeId: "store-4",
      title: "1kgステーキ完食で無料ゲット！！",
      body: "博多の牛王で念願の1kgステーキチャレンジ。40分かけてギリギリ完食！タダで食えた最高の肉でした。",
      mediaUrls: JSON.stringify(["https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80"]),
      isCompleted: true,
    },
  });
  await prisma.post.upsert({
    where: { id: "post-4" },
    update: {},
    create: {
      id: "post-4",
      userId: user2.id,
      storeId: "store-2",
      title: "山盛り定食のご飯3杯！コスパ最強",
      body: "大阪の山盛亭でご飯3杯おかわりした。1食900円でこの満足感はコスパ最強すぎる。また来週も行く。",
      mediaUrls: JSON.stringify(["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80"]),
      isCompleted: false,
    },
  });

  await prisma.like.upsert({
    where: { userId_postId: { userId: user2.id, postId: "post-1" } },
    update: {},
    create: { userId: user2.id, postId: "post-1" },
  });
  await prisma.like.upsert({
    where: { userId_postId: { userId: user1.id, postId: "post-3" } },
    update: {},
    create: { userId: user1.id, postId: "post-3" },
  });
  await prisma.comment.upsert({
    where: { id: "comment-1" },
    update: {},
    create: { id: "comment-1", userId: user2.id, postId: "post-1", body: "すごい！私も行ってみたい！" },
  });
  await prisma.comment.upsert({
    where: { id: "comment-2" },
    update: {},
    create: { id: "comment-2", userId: user1.id, postId: "post-2", body: "3.5kgでも十分すごいです！" },
  });

  console.log("✅ Seed complete!");
  console.log("テストアカウント: taro@example.com / password123");
  console.log("テストアカウント: hanako@example.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
