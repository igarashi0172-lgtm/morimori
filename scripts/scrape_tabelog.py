"""
食べログから「デカ盛り」「チャレンジメニュー」等で検索し
MORIMORIのDBに店舗データをインポートするスクリプト

使い方:
  python3 scripts/scrape_tabelog.py [--dry-run]

コスト: 完全無料
"""

from __future__ import annotations
import argparse
import json
import re
import sqlite3
import time
import uuid
from pathlib import Path
from urllib.parse import urlencode, quote

import requests

DB_PATH = Path(__file__).parent.parent / "prisma" / "dev.db"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ja,en-US;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://tabelog.com/",
}

# 検索クエリ（全部で口コミに「デカ盛り」「チャレンジ」が多い店が集まるよう網羅）
SEARCH_QUERIES = [
    # デカ盛り系
    "デカ盛り",
    "デカ盛りラーメン",
    "デカ盛り定食",
    "デカ盛りカレー",
    # チャレンジ系
    "チャレンジメニュー",
    "大食いチャレンジ",
    "完食チャレンジ",
    "大盛りチャレンジ",
    # メガ・キロ系
    "メガ盛り",
    "キロ盛り",
    "キロラーメン",
    # 二郎系（確実にデカ盛り文化）
    "ラーメン二郎",
    "二郎系ラーメン",
    "ジロリアン",
    # 家系（大盛り文化）
    "家系ラーメン",
    # その他大盛り文化の濃いワード
    "爆盛り",
    "鬼盛り",
    "山盛り定食",
    "大盛り無料",
    "替え玉無料",
]

MAX_PAGES = 5  # 各クエリ最大5ページ（1ページ20件 → 最大100件/クエリ）

GENRE_MAP = {
    "ラーメン": "ラーメン", "つけ麺": "ラーメン", "二郎": "ラーメン",
    "家系": "ラーメン", "ジロリアン": "ラーメン",
    "うどん": "うどん・そば", "そば": "うどん・そば",
    "カレー": "カレー",
    "焼肉": "焼肉・ステーキ", "ステーキ": "焼肉・ステーキ", "肉料理": "焼肉・ステーキ",
    "中華": "中華", "餃子": "中華", "台湾": "中華",
    "居酒屋": "居酒屋",
    "丼": "定食・丼", "定食": "定食・丼", "カツ": "定食・丼",
    "洋食": "洋食", "ハンバーグ": "洋食", "パスタ": "洋食",
    "ファスト": "ファストフード", "バーガー": "ファストフード",
}

STATION_RE = re.compile(r"([^\s/、]+(?:駅|駅前))\s*[\d.]+m")

CHALLENGE_WORDS = ["チャレンジ", "デカ盛", "メガ盛", "キロ盛", "大食い", "完食", "二郎", "爆盛", "鬼盛", "山盛り"]


# ------------------------------------------------------------------ #
# スクレイピング
# ------------------------------------------------------------------ #

def fetch_list_page(query: str, page: int) -> str:
    params = {"vs": 1, "sw": query, "sk": query, "p": page}
    url = f"https://tabelog.com/tokyo/rstLst/?{urlencode(params)}"
    resp = requests.get(url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return resp.text


def parse_stores(html: str, query: str) -> list[dict]:
    stores = []
    blocks = re.findall(
        r'<div class="list-rst__body">(.*?)(?=<div class="list-rst__body"|</article)',
        html, re.DOTALL
    )

    for block in blocks:
        m = re.search(
            r'class="list-rst__rst-name-target[^"]*"[^>]*href="([^"]+)"[^>]*>([^<]+)<',
            block
        )
        if not m:
            continue
        url  = m.group(1).strip()
        name = m.group(2).strip()

        # エリア・ジャンル行
        area_genre = re.search(r'class="list-rst__area-genre[^"]*"[^>]*>(.*?)</div>', block, re.DOTALL)
        area_text  = re.sub(r'\s+', ' ', area_genre.group(1)).strip() if area_genre else ""

        # 最寄駅
        sm = STATION_RE.search(area_text)
        station = sm.group(1).replace("駅前", "").replace("駅", "") if sm else None

        genre = guess_genre(area_text, name, query)

        is_challenge = any(w in name or w in query for w in CHALLENGE_WORDS)
        description  = "チャレンジメニューあり" if is_challenge else None

        stores.append({
            "name":           name,
            "address":        "東京都",
            "area":           "東京",
            "nearestStation": station,
            "genre":          genre,
            "phone":          None,
            "hours":          None,
            "description":    description,
            "imageUrl":       None,
            "closedDays":     None,
        })

    return stores


def guess_genre(area_text: str, name: str, query: str) -> str:
    text = " ".join([area_text, name, query])
    if "二郎" in text or "ジロリアン" in text:
        return "ラーメン"
    for key, genre in GENRE_MAP.items():
        if key in text:
            return genre
    return "その他"


def has_next_page(html: str) -> bool:
    return 'c-pagination__arrow--next' in html


# ------------------------------------------------------------------ #
# 収集メイン
# ------------------------------------------------------------------ #

def collect_stores() -> list[dict]:
    seen_names: set[str] = set()
    all_stores: list[dict] = []

    for query in SEARCH_QUERIES:
        print(f"\n  検索: 「{query}」東京")

        for page in range(1, MAX_PAGES + 1):
            print(f"    ページ {page} ...", end=" ", flush=True)
            try:
                html   = fetch_list_page(query, page)
                stores = parse_stores(html, query)
            except Exception as e:
                print(f"エラー: {e}")
                break

            if not stores:
                print("結果なし")
                break

            new = 0
            for s in stores:
                if s["name"] in seen_names:
                    continue
                seen_names.add(s["name"])
                all_stores.append(s)
                new += 1
            print(f"{len(stores)}件取得 / {new}件新規")

            if not has_next_page(html):
                break

            time.sleep(1.5)

        time.sleep(2)

    print(f"\n合計ユニーク店舗数: {len(all_stores)}")
    return all_stores


# ------------------------------------------------------------------ #
# DB インポート
# ------------------------------------------------------------------ #

def import_to_db(stores: list[dict]) -> None:
    conn = sqlite3.connect(DB_PATH)
    cur  = conn.cursor()
    inserted = skipped = 0

    for s in stores:
        cur.execute('SELECT id FROM "Store" WHERE name = ?', (s["name"],))
        if cur.fetchone():
            skipped += 1
            continue

        store_id = str(uuid.uuid4()).replace("-", "")[:25]
        cur.execute(
            """
            INSERT INTO "Store"
              (id, name, address, area, "nearestStation", genre, phone, hours,
               "closedDays", "imageUrl", description, "createdAt", "updatedAt")
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            """,
            (
                store_id, s["name"], s["address"], s["area"],
                s["nearestStation"], s["genre"], s["phone"], s["hours"],
                s["closedDays"], s["imageUrl"], s["description"],
            )
        )
        inserted += 1

    conn.commit()
    conn.close()
    print(f"DB登録: {inserted}件 / スキップ(重複): {skipped}件")


# ------------------------------------------------------------------ #
# エントリーポイント
# ------------------------------------------------------------------ #

def main():
    parser = argparse.ArgumentParser(description="食べログ スクレーパー（デカ盛り・チャレンジ特化）")
    parser.add_argument("--dry-run", action="store_true", help="DBに書き込まず結果だけ表示")
    parser.add_argument("--output", default="tabelog_output.json")
    args = parser.parse_args()

    print("=" * 50)
    print("MORIMORI 食べログスクレーパー")
    print(f"検索クエリ: {len(SEARCH_QUERIES)}種類 / 最大{MAX_PAGES}ページ/クエリ")
    print("対象: 東京 / コスト: 無料")
    print("=" * 50)

    stores = collect_stores()

    out_path = Path(__file__).parent / args.output
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(stores, f, ensure_ascii=False, indent=2)
    print(f"\n結果JSON保存: {out_path}")

    if args.dry_run:
        print("\n[dry-run] DBへの書き込みをスキップ")
        print(f"\n--- サンプル (先頭20件) ---")
        for s in stores[:20]:
            st = s["nearestStation"] or "不明"
            print(f"  {s['name']} / {s['genre']} / {st}駅 / {s['description'] or '-'}")
    else:
        print("\nDBにインポート中...")
        import_to_db(stores)
        print("完了！")


if __name__ == "__main__":
    main()
