from flask import request, jsonify
from ..agent import agent_executor
from collections import Counter
from datetime import datetime
from ..models import Catch

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
            f"For {sp}, you catch the most fish during **{best_tide or 'unknown tide'}**, "
            f"typically in the **{best_time or 'unknown time'}**, using **{best_bait or 'varied baits'}**. "
        )

        if best_spot:
            summary_text += f"Your top-performing location is **{best_spot}**."

        return {
            "species": species,
            "best_tide": best_tide,
            "best_time": best_time,
            "best_bait": best_bait,
            "best_spot": best_spot,
            "summary_text": summary_text
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