from flask import request, jsonify
from collections import Counter
from datetime import datetime
from ..models import Catch
from ..extensions import db
from collections import defaultdict
from calendar import month_abbr
from flask_jwt_extended import jwt_required, get_jwt_identity

def register_routes(app):
    @app.route("/stats/monthly-snapshot", methods=["GET"])
    @jwt_required()
    def monthly_snapshot():
        now = datetime.utcnow()
        start = datetime(now.year, now.month, 1)
        end = datetime(now.year + (now.month == 12), now.month % 12 + 1, 1)
        previous_start = datetime(now.year - (now.month == 1), (now.month - 2) % 12 + 1, 1)
        catches = Catch.query.filter(
            Catch.user_id == int(get_jwt_identity()),
            Catch.date_caught >= previous_start, Catch.date_caught < end,
        ).all()
        current = [catch for catch in catches if catch.date_caught >= start]
        previous_count = len(catches) - len(current)
        species = {" ".join((catch.species or "").split()).casefold() for catch in current}
        species.difference_update({"", "n/a"})
        difference = len(current) - previous_count
        return jsonify({
            "total_catches": len(current), "unique_species": len(species),
            "previous_catches": previous_count, "change": difference,
            "change_percent": round(difference * 100 / previous_count) if previous_count else None,
        }), 200

    @app.route("/stats/productive-locations", methods=["GET"])
    @jwt_required()
    def productive_locations():
        now = datetime.utcnow()
        start = datetime(now.year, now.month, 1)
        end = datetime(now.year + (now.month == 12), now.month % 12 + 1, 1)
        catches = Catch.query.filter(
            Catch.user_id == int(get_jwt_identity()),
            Catch.date_caught >= start, Catch.date_caught < end,
        ).order_by(Catch.date_caught.desc(), Catch.id.desc()).all()

        def clean(value):
            value = " ".join((value or "").split())
            return value if value.casefold() not in ("", "n/a") else None

        groups = {}
        for catch in catches:
            location = clean(catch.location)
            if location:
                group = groups.setdefault(location.casefold(), {"name": location, "catches": []})
                group["catches"].append(catch)

        def leaders(rows, field):
            names, counts = {}, Counter()
            for row in rows:
                value = clean(getattr(row, field))
                if value:
                    key = value.casefold()
                    names.setdefault(key, value)
                    counts[key] += 1
            maximum = max(counts.values(), default=0)
            return [{"name": names[key], "count": counts[key]}
                    for key in sorted(counts) if counts[key] == maximum]

        maximum = max((len(group["catches"]) for group in groups.values()), default=0)
        locations = []
        for key in sorted(groups):
            group = groups[key]
            rows = group["catches"]
            if len(rows) != maximum:
                continue
            locations.append({
                "name": group["name"], "count": len(rows),
                "share": round(len(rows) * 100 / len(catches)),
                "species": leaders(rows, "species"),
                "bait": leaders(rows, "bait_used"),
                "method": leaders(rows, "method"),
                "days_fished": len({row.date_caught.date() for row in rows}),
            })
        return jsonify({"total_catches": len(catches), "locations": locations}), 200
    
    @app.route("/stats/monthly-statistics", methods=["POST", "GET"])
    def monthly_stats():
        if request.method == "GET":
            user_id = request.args.get("user_id")
            period = request.args.get("period", "this_year")
        else:
            data = request.get_json() or {}
            user_id = data.get("user_id")
            period = data.get("period", "this_year")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        # ---------------------------------------------------------
        # Determine date range
        # ---------------------------------------------------------

        now = datetime.utcnow()

        if period == "this_year":
            start_date = datetime(now.year, 1, 1)
            end_date = datetime(now.year + 1, 1, 1)

        elif period == "last_year":
            start_date = datetime(now.year - 1, 1, 1)
            end_date = datetime(now.year, 1, 1)

        elif period == "all_time":
            start_date = None
            end_date = None

        else:
            return jsonify({
                "error": "Invalid period. Use this_year, last_year, or all_time."
            }), 400

        # ---------------------------------------------------------
        # Get user's catches
        # ---------------------------------------------------------

        query = Catch.query.filter_by(user_id=user_id)

        if start_date and end_date:
            query = query.filter(
                Catch.date_caught >= start_date,
                Catch.date_caught < end_date
            )

        catches = query.all()

        # ---------------------------------------------------------
        # Group catches by month
        # ---------------------------------------------------------

        monthly = {
            i: defaultdict(int)
            for i in range(1, 13)
        }

        for catch in catches:
            month = catch.date_caught.month
            monthly[month][catch.species] += 1

    # ---------------------------------------------------------
    # Build response
    # ---------------------------------------------------------

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
    
