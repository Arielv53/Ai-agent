import requests
import os
from datetime import datetime

OPENWEATHERMAP_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")

def get_weather_by_location_and_date(lat, lon, date_str):
    """
    Fetch historical weather using OpenWeatherMap Time Machine API
    - lat, lon: float
    - date_str: 'YYYY-MM-DD'
    """
    if not OPENWEATHERMAP_API_KEY:
        raise Exception("Missing OpenWeatherMap API key.")

    # Convert date string to UNIX timestamp
    dt = int(datetime.strptime(date_str, "%Y-%m-%d").timestamp())

    url = "https://api.openweathermap.org/data/2.5/onecall/timemachine"
    params = {
        "lat": lat,
        "lon": lon,
        "dt": dt,
        "appid": OPENWEATHERMAP_API_KEY,
        "units": "metric"
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        return {"error": "Failed to fetch weather", "details": response.json()}

    data = response.json()
    # You can modify what you want to return
    return {
        "temperature": data.get("current", {}).get("temp"),
        "weather": data.get("current", {}).get("weather", [{}])[0].get("description"),
        "wind_speed": data.get("current", {}).get("wind_speed"),
        "humidity": data.get("current", {}).get("humidity")
    }
