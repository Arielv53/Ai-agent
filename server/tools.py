from langchain.tools import Tool
from datetime import datetime
import random
from app import get_weather_by_location_and_date
from dateparser import parse as parse_date
from geopy.geocoders import Nominatim

# Custom photo recognition tool (to detect fish & landmarks)
# Tide/weather lookup tool (based on coordinates or date)
# Catch history analysis tool (reads from user DB or past logs)

# --- Custom Photo Recognition Tool (mocked for now) ---
def analyze_photo(image_path: str) -> str:
    # TODO: Replace this with real photo analysis
    return "Detected species: Largemouth Bass. Landmark: Wooden dock."

photo_tool = Tool(
    name="photo_analyzer",
    func=analyze_photo,
    description="Analyzes an uploaded fish photo to identify fish species and visible landmarks. Input should be the image file path."
)

# --- Tide/Weather Lookup Tool (real API) ---
def tide_weather_lookup(input_str: str) -> str:
    """
    Looks up weather and tide conditions for a specific date and location. 
    Supports formats like 'July 30 at Miami Beach' or '40.7,-74.0,2025-08-02'.
    Use only when the user asks for fishing weather, tides, or outdoor conditions.
    """
    from datetime import date as dt_date

    try:
        location_name = None

        if "," in input_str:
            parts = input_str.split(",")
            if len(parts) == 3:
                lat_str, lon_str, date_str = parts
            elif len(parts) == 2:
                lat_str, lon_str = parts
                date_str = dt_date.today().strftime("%Y-%m-%d")
            else:
                raise ValueError("Expected 2 or 3 values separated by commas.")

            lat = float(lat_str.strip())
            lon = float(lon_str.strip())
            location_name = f"{lat:.4f}, {lon:.4f}"

        else:
            if " at " not in input_str:
                raise ValueError("Expected format like 'July 30 at Miami Beach'")
            
            date_part, location_part = input_str.split(" at ")
            parsed_date = parse_date(date_part.strip())
            if not parsed_date:
                raise ValueError("Could not parse date")
            date_str = parsed_date.strftime("%Y-%m-%d")

            geolocator = Nominatim(user_agent="fishing_agent")
            location = geolocator.geocode(location_part.strip())
            if not location:
                raise ValueError("Could not find that location")
            lat = location.latitude
            lon = location.longitude
            location_name = location_part.strip()

        result = get_weather_by_location_and_date(lat, lon, date_str)
        if "error" in result:
            return f"⚠️ {result['error']}: {result.get('details', '')}"

        return (
            f"Here’s the weather forecast for {location_name} on {date_str}:\n"
            f"- 🌡️ Temperature: {result['temperature_avg']}°F\n"
            f"- 💧 Humidity: {result['humidity_avg']}%\n"
            f"- 💨 Wind Speed: {result['wind_speed_avg']} mph\n"
            f"- 🌤️ Weather Code: {result['sample_weather_code']}"
        )

    except Exception as e:
        return f"❌ Couldn't parse location or date: {str(e)}. Try something like 'July 30 at Miami Beach' or '40.7,-74.0'"



tide_weather_tool = Tool(
    name="tide_weather_lookup",
    func=tide_weather_lookup,
    description=(
        "Use this tool when the user asks for weather or tide info for a fishing location on a specific date. "
        "Input can be either: 'latitude,longitude,YYYY-MM-DD' OR a natural language phrase like 'today, tomorrow or this weekend at Miami Beach'."
    )
)

# --- Catch History Analysis Tool (mocked for now) ---
def analyze_catch_history(query: str) -> str:
    # TODO: Replace with actual user DB/log lookup
    mock_responses = [
        "Based on your past catches, use shiners around 7 AM near the rocky point.",
        "You usually catch more during incoming tide near the pier using worms."
    ]
    return random.choice(mock_responses)

catch_history_tool = Tool(
    name="catch_history_analyzer",
    func=analyze_catch_history,
    description="Analyzes user's past catch history to provide suggestions on bait, location, and time. Input should be a natural language query."
)

# Bundle all fishing tools
tools = [
    photo_tool,
    tide_weather_tool,
    catch_history_tool,
]