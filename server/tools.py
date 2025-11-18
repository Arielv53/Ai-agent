from langchain.tools import Tool
from .models import Catch

# Catch history analysis tool (reads from user DB or past logs)

# --- Catch History Analysis Tool ---
def analyze_catch_history(query: str) -> str:
    """Analyze user's past catch data to find helpful patterns."""
    query = query.lower()
    catches = Catch.query.all()

    if not catches:
        return "You haven't logged any catches yet. Try logging a few and I’ll start giving more personalized suggestions."

    # Determine if user mentioned a specific species
    species_list = [c.species.lower() for c in catches if c.species]
    mentioned_species = next((s for s in species_list if s in query), None)

    filtered = catches
    if mentioned_species:
        filtered = [c for c in catches if c.species and c.species.lower() == mentioned_species]

    if not filtered:
        return f"I didn’t find any catches for that species yet. Try logging more data first."

    # Most common bait used
    bait_counts = {}
    for c in filtered:
        if c.bait_used:
            bait_counts[c.bait_used] = bait_counts.get(c.bait_used, 0) + 1
    best_bait = max(bait_counts, key=bait_counts.get) if bait_counts else None

    # Most common tide
    tide_counts = {}
    for c in filtered:
        if c.tide:
            tide_counts[c.tide] = tide_counts.get(c.tide, 0) + 1
    best_tide = max(tide_counts, key=tide_counts.get) if tide_counts else None

    location_counts = {}
    for c in filtered:
        if c.location:
            location_counts[c.location] = location_counts.get(c.location, 0) + 1
    best_location = max(location_counts, key=location_counts.get) if location_counts else None

    # Average water temperature
    temps = [c.water_temp for c in filtered if c.water_temp is not None]
    avg_temp = round(sum(temps) / len(temps), 1) if temps else None

    # Average wind speed
    winds = [c.wind_speed for c in filtered if c.wind_speed is not None]  
    avg_wind = round(sum(winds) / len(winds), 1) if winds else None        

    # Average length and weight
    lengths = [c.length for c in filtered if c.length is not None]          
    avg_length = round(sum(lengths) / len(lengths), 1) if lengths else None 
    weights = [c.weight for c in filtered if c.weight is not None]          
    avg_weight = round(sum(weights) / len(weights), 1) if weights else None 

    # Most common fishing method
    method_counts = {}                                                     
    for c in filtered:                                                     
        if c.method:                                                       
            method_counts[c.method] = method_counts.get(c.method, 0) + 1   
    best_method = max(method_counts, key=method_counts.get) if method_counts else None  

    # Get most recent catch date
    recent_date = max(c.date_caught for c in filtered)

    # Build response
    summary_parts = []
    if mentioned_species:
        summary_parts.append(f"For **{mentioned_species.title()}**, here’s what I found:")
    if best_bait:
        summary_parts.append(f"🎣 You’ve had the most success using **{best_bait}**.")
    if best_tide:
        summary_parts.append(f"🌊 Most of your catches happened during **{best_tide.lower()} tide**.")
    if best_location:
        summary_parts.append(f"📍 Most of your catches were logged at **{best_location}**.")
    if avg_temp:
        summary_parts.append(f"🌡️ Average water temperature was around **{avg_temp}°F**.")
    if avg_wind:                                                           
        summary_parts.append(f"💨 Average wind speed was about **{avg_wind} mph**.")  
    if avg_length and avg_weight:                                          # 🆕
        summary_parts.append(f"📏 Average length: **{avg_length} in**, weight: **{avg_weight} lbs**.")  
    if best_method:                                                        
        summary_parts.append(f"⚓ Most common fishing method: **{best_method}**.")     
    summary_parts.append(f"📅 Your last logged catch was on **{recent_date.strftime('%B %d, %Y')}**.")

    if not summary_parts:
        return "I couldn’t find clear patterns yet — keep logging more catches and I’ll learn more!"

    return " ".join(summary_parts)

catch_history_tool = Tool(
    name="catch_history_analyzer",
    func=analyze_catch_history,
    description="Analyzes user's past catch history to provide suggestions on bait, location, and time. Input should be a natural language query."
)

# Bundle all fishing tools
tools = [
    catch_history_tool,
]