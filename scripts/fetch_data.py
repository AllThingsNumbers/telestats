"""Pobiera dane z Supabase i zapisuje je do data/site_data.json.
Uruchomienie (z folderu scripts):  python fetch_data.py
Wymaga pliku .env z SUPABASE_URL i SUPABASE_KEY (patrz .env.example).
"""
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

# Tabela z odcinkami każdego programu. Wpisz nazwę, gdy tabela powstanie.
TABLES = {"va-banque": "vabanque_odcinki", "1-z-10": None, "familiada": None}
# Ile odcinków wyemitowano łącznie (potrzebne do % postępu). Uzupełnij ręcznie.
TOTAL = {"va-banque": 792, "1-z-10": None, "familiada": None}


def count_episodes(table):
    if not table:
        return 0
    res = db.table(table).select("odcinek_id", count="exact").limit(1).execute()
    return res.count or 0


def latest_episodes(n=9):
    return (db.table("vabanque_odcinki").select("*")
            .order("odcinek_data", desc=True).limit(n).execute().data)


def episode_details(odcinek_id):
    ep = db.table("vabanque_odcinki").select("*").eq("odcinek_id", odcinek_id).single().execute().data
    player_ids = [ep["gracz_1"], ep["gracz_2"], ep["gracz_3"]]
    return {
        "odcinek": ep,
        "gracze": db.table("vabanque_gracze").select("*").in_("gracz_id", player_ids).execute().data,
        "pytania": db.table("vabanque_pytania").select("*").eq("odcinek_id", odcinek_id)
                     .order("pytanie_id").execute().data,
        "przebieg": db.table("vabanque_przebieg").select("*").eq("odcinek_id", odcinek_id)
                      .order("kolejnosc_w_odcinku").execute().data,
    }


def main():
    postep = {}
    for show, table in TABLES.items():
        n, total = count_episodes(table), TOTAL[show]
        postep[show] = {"odcinki": n, "lacznie": total, "procent": round(100 * n / total) if total else 0}
    latest = latest_episodes()
    out = {
        "postep": postep,
        "najnowsze": latest,
        "szczegoly": {e["odcinek_id"]: episode_details(e["odcinek_id"]) for e in latest},
    }
    path = Path(__file__).parent / "data" / "site_data.json"
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(out, ensure_ascii=False, indent=2, default=str), encoding="utf-8")
    print("Zapisano", path)
    for show, p in postep.items():
        print(f"  {show}: {p['odcinki']} odcinków ({p['procent']}%)")


if __name__ == "__main__":
    main()
