from flask import request, jsonify
from collections import Counter
from datetime import datetime
from ..models import Catch
from ..extensions import db
from collections import defaultdict
from calendar import month_abbr

def register_routes(app):
    
    @app.route("/stats/monthly-statistics", methods=["POST", "GET"])
    def monthly_stats():
        if request.method == "GET":
            user_id = request.args.get("user_id")
        else:
            data = request.get_json()
            user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        catches = Catch.query.filter_by(user_id=user_id).all()

        monthly = {
            i: defaultdict(int)
            for i in range(1, 13)
        }

        for catch in catches:
            month = catch.date_caught.month
            monthly[month][catch.species] += 1

        results = []

        for month in range(1, 13):
            results.append({
                "month": month_abbr[month],
                "species": dict(monthly[month])
            })

        return jsonify(results), 200


    @app.route("/stats/most-used-bait", methods=["POST", "GET"])
    def most_used_bait():
        if request.method == "GET":
            user_id = request.args.get("user_id")
        else:
            data = request.get_json()
            user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # Get the current month
        current_month = datetime.utcnow().month

        # Get this user's catches
        catches = Catch.query.filter_by(user_id=user_id).all()

        # Only consider catches from the current month
        current_month_catches = [
            catch
            for catch in catches
            if catch.date_caught.month == current_month
        ]

        # Ignore catches without a bait/lure
        bait_counts = Counter(
            catch.bait_used
            for catch in current_month_catches
            if catch.bait_used
        )

        # No bait/lure data this month
        if not bait_counts:
            return jsonify({
                "bait": None,
                "count": 0
            }), 200

        # Most frequently used bait/lure
        most_used, count = bait_counts.most_common(1)[0]

        return jsonify({
            "bait": most_used,
            "count": count
        }), 200
    