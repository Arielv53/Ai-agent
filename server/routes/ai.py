from flask import request, jsonify
from ..agent import agent_executor
from collections import Counter
from datetime import datetime
from ..models import Catch
from openai import OpenAI
from ..extensions import db
from ..models import MonthlyForecast

client = OpenAI()

def register_routes(app):
    @app.route("/ai/conditions_summary", methods=["POST"])
    def conditions_summary():
        data = request.get_json()
        user_id = data.get("user_id")
        species = data.get("species")  # optional

        insights = get_conditions_summary(user_id, species)
        return jsonify(insights)
    
    def get_conditions_summary(user_id, species=None):
        # 1. Load user catch data (filtered by species if provided)
        if species:
            catches = Catch.query.filter_by(user_id=user_id, species=species).all()
        else:
            catches = Catch.query.filter_by(user_id=user_id).all()

        if not catches:
            return {
                "species": species,
                "error": "No catch data available.",
                "summary_text": "No catches logged yet for this species."
            }

        # 2. Extract attributes
        tides = [c.tide for c in catches if c.tide]
        baits = [c.bait_used for c in catches if c.bait_used]
        spots = [c.location for c in catches if c.location]

        # Derive time-of-day categories (morning, afternoon, night)
        def categorize_time(dt):
            hour = dt.hour
            if 5 <= hour <= 11: return "morning"
            if 12 <= hour <= 17: return "afternoon"
            return "night"

        times = [categorize_time(c.date_caught) for c in catches if c.date_caught]

        # 3. Compute best patterns
        best_tide = Counter(tides).most_common(1)[0][0] if tides else None
        best_bait = Counter(baits).most_common(1)[0][0] if baits else None
        best_time = Counter(times).most_common(1)[0][0] if times else None
        best_spot = Counter(spots).most_common(1)[0][0] if spots else None

        # 4. Generate natural language summary
        sp = species if species else "your catches"

        summary_text = (
            f"For {sp}, you catch the most fish during {best_tide or 'unknown tide'} tide, "
            f"typically in the {best_time or 'unknown time'}, using {best_bait or 'varied baits'}. "
        )

        if best_spot:
            summary_text += f"Your top-performing location is {best_spot}."

        return {
            "species": species,
            "best_tide": best_tide,
            "best_time": best_time,
            "best_bait": best_bait,
            "best_spot": best_spot,
            "summary_text": summary_text
        }
    
    

    @app.route("/ai/monthly_forecast", methods=["GET"])
    def monthly_forecast():
        user_id = request.args.get("user_id")
        print("MONTHLY FORECAST user_id =", user_id)

        if not user_id:
            return jsonify({"error": "Missing user_id"}), 400

        from datetime import datetime
        now = datetime.now()
        month = now.month
        year = now.year

    
        # Step 1 — Check Cache
        cached = MonthlyForecast.query.filter_by(
            user_id=user_id,
            month=month,
            year=year
        ).first()

        if cached:
            print("Returning CACHED monthly forecast")
            return jsonify({
                "forecast_text": cached.forecast_text,
                "cached": True
            })

        # Step 2 — Generate stats (your existing logic)
        stats = generate_monthly_forecast(user_id)
        print("STATS =", stats)

        if isinstance(stats, str):  # Not enough data
            return jsonify({"forecast_text": stats})

        top_species = stats["species"]
        top_location = stats["location"]
        top_bait = stats["bait"]
        top_tide = stats["tide"]

        month_name = now.strftime("%B")

        # Build LLM prompt
        prompt = f"""
        Based on this user's historical fishing performance:

        Month: {month_name}
        Best species: {top_species}
        Best location: {top_location}
        Best bait: {top_bait}
        Best tide: {top_tide}

        Write a short, upbeat monthly fishing forecast (1–2 sentences).
        Make it friendly, confident, and motivating.
        """

        # Step 3 — LLM call
        try:
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}]
            )

            forecast_text = completion.choices[0].message.content

        # -----------------------------------------------
            # 🔵 NEW: Step 4 — Save cache entry
        # -----------------------------------------------
            new_entry = MonthlyForecast(
                user_id=user_id,
                month=month,
                year=year,
                forecast_text=forecast_text
            )
            db.session.add(new_entry)
            db.session.commit()

            return jsonify({
                "forecast_text": forecast_text,
                "cached": False,
                "raw_stats": stats
            })

        except Exception as e:
            return jsonify({"error": f"OpenAI error: {str(e)}"}), 500
        

    def generate_monthly_forecast(user_id):
        print("FETCHING CATCHES FOR USER:", user_id)
        catches = Catch.query.filter_by(user_id=user_id).all()
        print("CATCHES FOUND:", catches)

        # 🔹 Debug: log each catch with its month
        for c in catches:
            print(f"CATCH: {c.species} | {c.date_caught} | month={c.date_caught.month}")

        this_month = datetime.now().month

        # 🔥 NEW: Use ALL catches from this same month across any year
        month_data = [c for c in catches if c.date_caught.month == this_month]

        if not month_data:
            return "Not enough data for a forecast."

        from collections import Counter
        species = Counter([c.species for c in month_data])
        location = Counter([c.location for c in month_data])
        bait = Counter([c.bait_used for c in month_data])
        tide = Counter([c.tide for c in month_data])

        top_species = species.most_common(1)[0][0]
        top_location = location.most_common(1)[0][0]
        top_bait = bait.most_common(1)[0][0]
        top_tide = tide.most_common(1)[0][0]

        return {
            "species": top_species,
            "location": top_location,
            "bait": top_bait,
            "tide": top_tide
        }




    @app.route("/chat", methods=["POST"])
    def chat():
        data = request.get_json()
        query = data.get("message", "")

        if not query:
            return jsonify({"reply": "⚠️ No input received."}), 400

        try:
            response = agent_executor.invoke({"query": query})
            return jsonify({"reply": response["output"]})
        except Exception as e:
            return jsonify({"reply": f"❌ Agent error: {str(e)}"}), 500