import requests
from datetime import datetime, timedelta

def get_weather_by_location_and_date(lat, lon, date_str):
    try:
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return {"error": "Invalid date format. Expected YYYY-MM-DD."}
    
    today = datetime.utcnow().date()
    max_forecast_date = today + timedelta(days=15)

    if not (today <= date_obj <= max_forecast_date):
        return {"error": f"Date must be between {today} and {max_forecast_date}"}

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": date_str,
        "end_date": date_str,
        "hourly": "temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m",
        "timezone": "auto"
    }

    response = requests.get(url, params=params)
    print("📡 Weather URL:", response.url)
    
    if response.status_code != 200:
        try:
            error_details = response.json()
        except ValueError:
            error_details = response.text
        return {"error": "Failed to fetch weather", "details": error_details}

    data = response.json()
    if not data.get("hourly"):
        return {"error": "No weather data found for this date."}

    try:
        hourly = data["hourly"]
        temp_avg = sum(hourly["temperature_2m"]) / len(hourly["temperature_2m"])
        humidity_avg = sum(hourly["relative_humidity_2m"]) / len(hourly["relative_humidity_2m"])
        wind_avg = sum(hourly["wind_speed_10m"]) / len(hourly["wind_speed_10m"])
    except (KeyError, ZeroDivisionError) as e:
        return {"error": "Incomplete weather data", "details": str(e)}

    fahrenheit_temp = (temp_avg * 9/5) + 32

    return {
        "temperature_avg": round(fahrenheit_temp, 1),
        "humidity_avg": round(humidity_avg, 1),
        "wind_speed_avg": round(wind_avg, 1),
        "sample_weather_code": hourly["weathercode"][0] if "weathercode" in hourly else None
    }