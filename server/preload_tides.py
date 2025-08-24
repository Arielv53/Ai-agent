import argparse
import time
from datetime import datetime, timedelta
import requests
from dateutil import parser as dateutil_parser
from .app import app
from .models import db, Tide

NOAA_BASE_URL = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"

def fetch_tides(station_id, days):
    start = datetime.utcnow()
    end = start + timedelta(days=days)

    params = {
        "product": "predictions",
        "application": "fishing-ai",
        "begin_date": start.strftime("%Y%m%d"),
        "end_date": end.strftime("%Y%m%d"),
        "datum": "MLLW",
        "station": station_id,
        "time_zone": "gmt",
        "units": "english",
        "interval": "hilo",   # high/low tides only
        "format": "json"
    }

    print(f"Fetching tides for station {station_id} ({days} days)...")
    try:
        resp = requests.get(NOAA_BASE_URL, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        print(f"❌ Failed for station {station_id}: {e}")
        return []

    predictions = data.get("predictions", [])
    tides = []
    for p in predictions:
        dt = datetime.strptime(p["t"], "%Y-%m-%d %H:%M")
        tides.append(
            Tide(
                station_id=station_id,
                datetime=dt,
                height=float(p["v"]),
                tide_type=p["type"]  # "H" or "L"
            )
        )
    print(f"✅ Got {len(tides)} tides for station {station_id}")
    return tides


def preload(stations, days):
    with app.app_context():
        all_tides = []
        for i, station in enumerate(stations, start=1):
            print(f"\n[{i}/{len(stations)}] Processing station {station}")
            tides = fetch_tides(station, days)
            if tides:
                all_tides.extend(tides)
                db.session.bulk_save_objects(tides)
                db.session.commit()
            time.sleep(0.2)  # prevent hammering NOAA API
        print(f"\n🎉 Finished! Inserted {len(all_tides)} tide records.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--stations", nargs="+", required=True, help="List of station IDs")
    parser.add_argument("--days", type=int, default=30, help="Number of days of predictions to fetch")
    args = parser.parse_args()

    preload(args.stations, args.days)