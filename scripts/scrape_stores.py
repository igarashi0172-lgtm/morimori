"""
Google Places API (New) を使って東京の大盛り・デカ盛り・チャレンジメニュー店を収集し
MORIMORIのDBに直接インポートするスクリプト

使い方:
  python3 scripts/scrape_stores.py --api-key YOUR_API_KEY [--dry-run]

  --dry-run : DBに書き込まず取得結果だけ表示する

【コスト】
  TextSearch (New): $0.032/回
  キーワード13 × エリア6 = 78回 → 約$2.5（無料枠$200内）
"""

from __future__ import annotations
import argparse
import json
import re
import sqlite3
import time
import uuid
from pathlib import Path

import requests

# ------------------------------------------------------------------ #
# 設定
# ------------------------------------------------------------------ #

DB_PATH = Path(__file__).parent.parent / "prisma" / "dev.db"

# 主要エリアに絞る（重複が多い近接エリアを統合）
AREAS = {
    "新宿":   (35.6896, 139.7006),
    "渋谷":   (35.6584, 139.7022),
    "池袋":   (35.7295, 139.7109),
    "秋葉原": (35.6980, 139.7731),
    "上野":   (35.7089, 139.7966),
    "赤羽":   (35.7779, 139.7214),
}

# 精選キーワード（デカ盛り・チャレンジ優先、確実に関連する店が出るもの）
SEARCH_KEYWORDS = [
    # チャレンジ・デカ盛り系（最優先）
    "デカ盛り ラーメン 東京",
    "デカ盛り 定食 丼 東京",
    "チャレンジメニュー 東京",
    "大食いチャレンジ 完食 東京",
    "メガ盛り キロ盛り 東京",
    # 二郎系（大盛り文化の代表格）
    "ラーメン二郎 東京",
    "二郎系ラーメン 東京",
    "家系ラーメン 大盛り 東京",
    # 大盛りジャンル
    "大盛り ラーメン 東京",
    "大盛り カレー 東京",
    "大盛り 定食 丼 東京",
    "大盛り 焼肉 ステーキ 東京",
    "大盛り 中華 東京",
]

# 店名・クエリにこれらが含まれれば「大盛り関連」と判定
OOMORI_KEYWORDS = [
    "大盛", "デカ盛", "メガ盛", "キロ盛", "チャレンジ", "大食", "完食",
    "特盛", "超盛", "爆盛", "鬼盛", "てんこ盛", "盛り放題",
    "二郎", "家系", "ジロリアン",
]

GENRE_MAP = {
    "ラーメン":    "ラーメン",
    "ramen":       "ラーメン",
    "二郎":        "ラーメン",
    "家系":        "ラーメン",
    "つけ麺":      "ラーメン",
    "soba":        "うどん・そば",
    "うどん":      "うどん・そば",
    "そば":        "うどん・そば",
    "curry":       "カレー",
    "カレー":      "カレー",
    "焼肉":        "焼肉・ステーキ",
    "yakiniku":    "焼肉・ステーキ",
    "steak":       "焼肉・ステーキ",
    "steakhouse":  "焼肉・ステーキ",
    "ステーキ":    "焼肉・ステーキ",
    "chinese":     "中華",
    "中華":        "中華",
    "餃子":        "中華",
    "izakaya":     "居酒屋",
    "居酒屋":      "居酒屋",
    "fast_food":   "ファストフード",
    "定食":        "定食・丼",
    "丼":          "定食・丼",
    "どんぶり":    "定食・丼",
    "洋食":        "洋食",
    "ハンバーグ":  "洋食",
    "パスタ":      "洋食",
}

STATION_HINTS = {
    "新宿": "新宿", "高田馬場": "高田馬場", "渋谷": "渋谷",
    "恵比寿": "恵比寿", "池袋": "池袋", "秋葉原": "秋葉原",
    "神田": "神田", "上野": "上野", "浅草": "浅草",
    "品川": "品川", "五反田": "五反田", "赤羽": "赤羽",
    "板橋": "板橋", "吉祥寺": "吉祥寺", "三鷹": "三鷹",
    "錦糸町": "錦糸町", "亀戸": "亀戸", "蒲田": "蒲田",
}

CHALLENGE_WORDS = ["チャレンジ", "デカ盛り", "メガ盛り", "キロ盛り", "大食い", "完食"]

# ------------------------------------------------------------------ #
# 精査フィルター
# ------------------------------------------------------------------ #

# 明らかに無関係な業態タイプ
EXCLUDED_TYPES = {
    "lodging", "hotel", "convenience_store", "grocery_or_supermarket",
    "supermarket", "department_store", "shopping_mall", "clothing_store",
    "electronics_store", "furniture_store", "hardware_store",
    "beauty_salon", "hair_care", "spa", "gym", "hospital",
    "pharmacy", "bank", "atm", "gas_station", "car_dealer",
    "car_rental", "parking", "transit_station", "subway_station",
    "train_station", "airport", "bus_station",
    "tourist_attraction", "museum", "park", "zoo",
    "amusement_park", "stadium", "movie_theater",
    "school", "university", "library", "church",
    "real_estate_agency", "travel_agency",
}

# 大盛り関連として信頼できるキーワード（クエリに含まれる場合は無条件採用）
TRUSTED_QUERY_WORDS = [
    "デカ盛り", "チャレンジ", "大食い", "完食", "メガ盛り", "キロ盛り",
    "ラーメン二郎", "二郎系", "家系ラーメン",
]


def is_relevant(name: str, query: str, types: list[str], rating_count: int) -> bool:
    """大盛り・デカ盛り・チャレンジ系として採用するか判定"""
    # 明らかに飲食店でないタイプを除外
    if any(t in EXCLUDED_TYPES for t in types):
        has_food = any(t in ("restaurant", "food", "meal_delivery", "meal_takeaway", "cafe") for t in types)
        if not has_food:
            return False

    # 店名に大盛り関連ワードが含まれる → 口コミ数問わず採用（名前が証拠）
    if any(w in name for w in OOMORI_KEYWORDS):
        return True

    # 信頼できるキーワード（デカ盛り・チャレンジ系）で検索 かつ 口コミ50件以上
    if any(w in query for w in TRUSTED_QUERY_WORDS):
        return rating_count >= 50

    # 大盛り系一般クエリ → 口コミ100件以上（そこそこ有名な店に絞る）
    if "大盛り" in query:
        return rating_count >= 100

    return False


# ------------------------------------------------------------------ #
# Places API (New)
# ------------------------------------------------------------------ #

NEW_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"


def text_search_new(query: str, lat: float, lng: float, api_key: str) -> list[dict]:
    """Places API (New) Text Search"""
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.id,places.displayName,places.formattedAddress,"
            "places.nationalPhoneNumber,places.regularOpeningHours,"
            "places.types,places.location,places.userRatingCount,places.rating"
        ),
    }
    body: dict = {
        "textQuery": query,
        "languageCode": "ja",
        "maxResultCount": 20,
        "locationBias": {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": 3000.0,
            }
        },
    }

    results: list[dict] = []

    resp = requests.post(NEW_SEARCH_URL, headers=headers, json=body, timeout=15)
    if resp.status_code != 200:
        print(f"  API エラー {resp.status_code}: {resp.text[:200]}")
        return []

    data = resp.json()
    results.extend(data.get("places", []))
    return results


# ------------------------------------------------------------------ #
# ジャンル・駅推定
# ------------------------------------------------------------------ #

def guess_genre(types: list[str], name: str, query: str) -> str:
    text = " ".join(types + [name, query]).lower()
    if any(w in name or w in query for w in CHALLENGE_WORDS):
        if "ラーメン" in text or "二郎" in text or "家系" in text:
            return "ラーメン"
        if "カレー" in text:
            return "カレー"
        if "定食" in text or "丼" in text:
            return "定食・丼"
        return "定食・丼"
    for key, genre in GENRE_MAP.items():
        if key in text:
            return genre
    return "その他"


def guess_nearest_station(address: str) -> str | None:
    for hint, station in STATION_HINTS.items():
        if hint in address:
            return station
    return None


def format_hours(opening_hours: dict) -> str | None:
    texts = opening_hours.get("weekdayDescriptions", [])
    if texts:
        return " / ".join(texts[:3])
    return None


# ------------------------------------------------------------------ #
# 収集メイン
# ------------------------------------------------------------------ #

def collect_stores(api_key: str) -> list[dict]:
    seen_ids: set[str] = set()
    stores: list[dict] = []
    total_calls = 0
    skipped_irrelevant = 0

    for area_name, (lat, lng) in AREAS.items():
        for keyword in SEARCH_KEYWORDS:
            query = f"{keyword} {area_name}"
            print(f"  検索: {query}")

            results = text_search_new(query, lat, lng, api_key)
            total_calls += 1

            adopted = 0
            for r in results:
                pid = r.get("id")
                if not pid or pid in seen_ids:
                    continue

                name         = r.get("displayName", {}).get("text", "")
                address      = r.get("formattedAddress", "")
                types        = r.get("types") or []
                rating_count = r.get("userRatingCount") or 0

                # 東京以外を除外
                if "東京" not in address and "Tokyo" not in address:
                    continue

                # 精査フィルター（口コミ件数込み）
                if not is_relevant(name, keyword, types, rating_count):
                    skipped_irrelevant += 1
                    continue

                seen_ids.add(pid)
                phone   = r.get("nationalPhoneNumber")
                hours   = format_hours(r.get("regularOpeningHours", {}))
                genre   = guess_genre(types, name, keyword)
                station = guess_nearest_station(address)

                # 店名かキーワードに明確なチャレンジ語がある場合のみフラグ立て
                STRICT_CHALLENGE = ["チャレンジ", "デカ盛り", "メガ盛り", "キロ盛り", "大食い", "完食", "二郎", "爆盛", "鬼盛"]
                is_challenge = any(w in name for w in STRICT_CHALLENGE) or \
                               any(w in keyword for w in ["チャレンジ", "デカ盛り", "メガ盛り", "キロ盛り", "大食い", "完食", "二郎系", "ラーメン二郎"])
                description  = "チャレンジメニューあり" if is_challenge else None

                clean_address = re.sub(r"^日本、?〒\d{3}-\d{4}\s*", "", address)
                clean_address = re.sub(r"^日本、?", "", clean_address)

                stores.append({
                    "place_id":       pid,
                    "name":           name,
                    "address":        clean_address,
                    "area":           "東京",
                    "nearestStation": station,
                    "genre":          genre,
                    "phone":          phone,
                    "hours":          hours,
                    "description":    description,
                    "imageUrl":       None,
                    "closedDays":     None,
                })
                adopted += 1

            print(f"    → {len(results)}件取得 / {adopted}件採用（口コミ数・精査後）")
            time.sleep(0.3)

    print(f"\n合計APIコール数: {total_calls}（コスト概算: ${total_calls * 0.032:.2f}）")
    print(f"無関係としてスキップ: {skipped_irrelevant}件")
    print(f"ユニーク店舗数:  {len(stores)}")
    return stores


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
                store_id,
                s["name"],
                s["address"],
                s["area"],
                s["nearestStation"],
                s["genre"],
                s["phone"],
                s["hours"],
                s["closedDays"],
                s["imageUrl"],
                s["description"],
            )
        )
        inserted += 1

    conn.commit()
    conn.close()
    print(f"\nDB登録: {inserted}件 / スキップ(重複): {skipped}件")


# ------------------------------------------------------------------ #
# エントリーポイント
# ------------------------------------------------------------------ #

def main():
    parser = argparse.ArgumentParser(description="MORIMORIストアスクレーパー")
    parser.add_argument("--api-key", required=True, help="Google Places APIキー")
    parser.add_argument("--dry-run", action="store_true", help="DBに書き込まず結果だけ表示")
    parser.add_argument("--output", default="stores_output.json", help="結果JSONの出力先")
    args = parser.parse_args()

    print("=" * 50)
    print("MORIMORI 店舗データ収集スクリプト (Places API New)")
    print("=" * 50)
    print(f"対象エリア: {len(AREAS)}エリア（東京主要）")
    print(f"検索キーワード: {len(SEARCH_KEYWORDS)}種類（精選済）")
    print(f"APIコール予定: {len(AREAS) * len(SEARCH_KEYWORDS)}回")
    print(f"コスト上限概算: ${len(AREAS) * len(SEARCH_KEYWORDS) * 0.032:.2f}（無料枠$200内）")
    print()

    stores = collect_stores(args.api_key)

    out_path = Path(__file__).parent / args.output
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(stores, f, ensure_ascii=False, indent=2)
    print(f"\n結果をJSONに保存: {out_path}")

    if args.dry_run:
        print("\n[dry-run] DBへの書き込みをスキップ")
        print("\n--- サンプル (先頭10件) ---")
        for s in stores[:10]:
            st = s["nearestStation"] or "不明"
            print(f"  {s['name']} / {s['genre']} / {st}駅 / {s['description'] or '-'}")
    else:
        print("\nDBにインポート中...")
        import_to_db(stores)
        print("完了！")


if __name__ == "__main__":
    main()
