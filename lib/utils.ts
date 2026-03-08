import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export const GENRES = [
  "ラーメン",
  "定食・丼",
  "焼肉・ステーキ",
  "カレー",
  "うどん・そば",
  "中華",
  "洋食",
  "居酒屋",
  "ファストフード",
  "食べ放題",
  "その他",
] as const;

export const AREAS = [
  "北海道",
  "東北",
  "関東",
  "東京",
  "中部",
  "関西",
  "大阪",
  "中国・四国",
  "九州・沖縄",
] as const;
