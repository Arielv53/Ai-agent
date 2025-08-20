import argparse
import time
from datetime import date, timedelta
import requests
from dateutil import parser as dateutil_parser
from .app import app
from .models import db, Tide

NOAA_BASE = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter"

def fetch_hilo_predictions(station_id: str, begin_date: date, end_date: date, units="english"):
    params = {
        "product": "predictions",
        "datum": "MLLW",
        "time_zone": "gmt",       # get results in UTC
        "units": units,          # 'english' or 'metric'
        "interval": "hilo",      # high/low only
        "format": "json",
        "begin_date": begin_date.strftime("%Y%m%d"),
        "end_date": end_date.strftime("%Y%m%d"),
        "station": station_id,
    }
    r = requests.get(NOAA_BASE, params=params, timeout=30)
    r.raise_for_status()
    return r.json().get("predictions", [])

def upsert_predictions_for_station(station_id, predictions):
    inserted = 0
    for p in predictions:
        # NOAA returns something like {'t': '2025-08-03 05:14', 'v': '1.23', 'type': 'H'}
        t_raw = p.get("t")
        if not t_raw:
            continue
        dt = dateutil_parser.parse(t_raw)  # will be timezone-aware if NOAA supplies tz
        height = float(p.get("v", 0.0))
        tide_type = p.get("type", "").upper()  # 'H' or 'L'
        # prevent duplicates (station + datetime)
        exists = Tide.query.filter_by(station_id=station_id, datetime=dt).first()
        if exists:
            continue
        tide = Tide(station_id=station_id, datetime=dt, height=height, tide_type=tide_type)
        db.session.add(tide)
        inserted += 1
    db.session.commit()
    return inserted

def main(stations, days):
    today = date.today()
    end = today + timedelta(days=days)
    with app.app_context():
        for st in stations:
            print(f"Fetching station {st} from {today} to {end}")
            try:
                preds = fetch_hilo_predictions(st, today, end)
            except Exception as e:
                print(f"  ERROR fetching {st}: {e}")
                continue
            inserted = upsert_predictions_for_station(st, preds)
            print(f"  Inserted {inserted} new tide records for {st}")
            time.sleep(1)  # be kind to NOAA
    print("Done.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--stations", nargs="+", required=True,
                        help="List of NOAA station IDs, e.g. 8518750")
    parser.add_argument("--days", type=int, default=365, help="How many days to fetch from today")
    args = parser.parse_args()
    main(args.stations, args.days)
