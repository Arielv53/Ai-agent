from flask import request, jsonify
from collections import Counter
from datetime import datetime
from ..models import Catch
from ..extensions import db
from ..premium import premium_required
from collections import defaultdict
from calendar import month_abbr
from flask_jwt_extended import jwt_required, get_jwt_identity


def clean_stat_value(value):
    cleaned = " ".join((value or "").split())
    return cleaned if cleaned.casefold() not in ("", "n/a") else None


def display_number(value):
    return str(int(value)) if float(value).is_integer() else str(round(value, 1))


def register_routes(app):
    @app.route("/stats/year-over-year", methods=["GET"])
    @premium_required
    def year_over_year(user):
        current_year = datetime.utcnow().year
        previous_year = current_year - 1
        start = datetime(previous_year, 1, 1)
        end = datetime(current_year + 1, 1, 1)
        catches = Catch.query.filter(
            Catch.user_id == user.id,
            Catch.date_caught >= start,
            Catch.date_caught < end,
        ).order_by(
            Catch.date_caught.asc(),
            Catch.id.asc(),
        ).all()
        current = [
            catch
            for catch in catches
            if catch.date_caught.year == current_year
        ]
        previous = [
            catch
            for catch in catches
            if catch.date_caught.year == previous_year
        ]

        def summary(rows):
            species = {
                clean_stat_value(catch.species).casefold()
                for catch in rows
                if clean_stat_value(catch.species)
            }
            weights = [
                catch.weight
                for catch in rows
                if catch.weight is not None and catch.weight > 0
            ]

            return {
                "catches": len(rows),
                "species": len(species),
                "average_weight": (
                    round(sum(weights) / len(weights), 1)
                    if weights
                    else None
                ),
                "personal_best": max(weights, default=None),
            }

        current_summary = summary(current)
        previous_summary = summary(previous)

        def change(current_value, previous_value, percent=False):
            if current_value is None or previous_value is None:
                return None

            difference = round(current_value - previous_value, 1)

            if not percent:
                return difference

            return (
                round(difference * 100 / previous_value)
                if previous_value
                else None
            )

        current_species = Counter()
        previous_species = Counter()
        species_names = {}

        for rows, counter in (
            (current, current_species),
            (previous, previous_species),
        ):
            for catch in rows:
                species = clean_stat_value(catch.species)

                if species:
                    key = species.casefold()
                    species_names.setdefault(key, species)
                    counter[key] += 1

        species_changes = []

        for key in set(current_species) | set(previous_species):
            current_count = current_species[key]
            previous_count = previous_species[key]
            species_changes.append({
                "species": species_names[key],
                "current": current_count,
                "previous": previous_count,
                "change": current_count - previous_count,
            })

        species_changes.sort(
            key=lambda item: (
                -abs(item["change"]),
                item["species"].casefold(),
            ),
        )

        monthly_current = Counter(
            catch.date_caught.month
            for catch in current
        )
        monthly_previous = Counter(
            catch.date_caught.month
            for catch in previous
        )

        return jsonify({
            "current_year": current_year,
            "previous_year": previous_year,
            "current": current_summary,
            "previous": previous_summary,
            "changes": {
                "catches": change(
                    current_summary["catches"],
                    previous_summary["catches"],
                    percent=True,
                ),
                "species": change(
                    current_summary["species"],
                    previous_summary["species"],
                ),
                "average_weight": change(
                    current_summary["average_weight"],
                    previous_summary["average_weight"],
                ),
                "personal_best": change(
                    current_summary["personal_best"],
                    previous_summary["personal_best"],
                ),
            },
            "monthly": [
                {
                    "month": month_abbr[month],
                    "current": monthly_current[month],
                    "previous": monthly_previous[month],
                }
                for month in range(1, 13)
            ],
            "species_changes": species_changes[:3],
        }), 200

    @app.route("/stats/progress-overview", methods=["GET"])
    @jwt_required()
    def progress_overview():
        now = datetime.utcnow()
        user_id = int(get_jwt_identity())
        catches = Catch.query.filter(
            Catch.user_id == user_id,
        ).order_by(
            Catch.date_caught.asc(),
            Catch.id.asc(),
        ).all()

        species_names = {}
        species_counts = Counter()
        first_species_catches = {}

        for catch in catches:
            species = clean_stat_value(catch.species)

            if not species:
                continue

            key = species.casefold()
            species_names.setdefault(key, species)
            species_counts[key] += 1
            first_species_catches.setdefault(key, catch)

        species = [
            {
                "name": species_names[key],
                "count": species_counts[key],
            }
            for key in sorted(
                species_counts,
                key=lambda item: (
                    -species_counts[item],
                    species_names[item].casefold(),
                ),
            )
        ]

        milestones = []
        newest_species_catch = max(
            first_species_catches.values(),
            key=lambda row: (
                row.date_caught,
                row.id,
            ),
            default=None,
        )

        if newest_species_catch:
            milestones.append({
                "type": "new_species",
                "title": (
                    "New species: "
                    f"{clean_stat_value(newest_species_catch.species)}"
                ),
                "date_caught": newest_species_catch.date_caught.date().isoformat(),
            })

        best_weight = None
        best_length = None
        measurement_milestones = []

        for catch in catches:
            species = clean_stat_value(catch.species)
            species_suffix = f" {species}" if species else ""

            if catch.weight is not None and catch.weight > 0:
                if best_weight is None or catch.weight > best_weight:
                    best_weight = catch.weight
                    measurement_milestones.append({
                        "type": "personal_best",
                        "title": (
                            "New personal best: "
                            f"{display_number(catch.weight)} lb"
                            f"{species_suffix}"
                        ),
                        "date_caught": catch.date_caught.date().isoformat(),
                        "sort_key": (
                            catch.date_caught,
                            catch.id,
                        ),
                    })

            if catch.length is not None and catch.length > 0:
                if best_length is None or catch.length > best_length:
                    best_length = catch.length
                    measurement_milestones.append({
                        "type": "personal_best",
                        "title": (
                            "New personal best: "
                            f"{display_number(catch.length)} in"
                            f"{species_suffix}"
                        ),
                        "date_caught": catch.date_caught.date().isoformat(),
                        "sort_key": (
                            catch.date_caught,
                            catch.id,
                        ),
                    })

        if measurement_milestones:
            personal_best = max(
                measurement_milestones,
                key=lambda item: item["sort_key"],
            )
            personal_best.pop("sort_key")
            milestones.append(personal_best)

        month_start = datetime(now.year, now.month, 1)
        next_month = datetime(
            now.year + (now.month == 12),
            now.month % 12 + 1,
            1,
        )
        monthly_count = Catch.query.filter(
            Catch.user_id == user_id,
            Catch.date_caught >= month_start,
            Catch.date_caught < next_month,
        ).count()
        lure_count = sum(
            1
            for catch in catches
            if clean_stat_value(catch.lure_used)
        )
        bait_count = sum(
            1
            for catch in catches
            if clean_stat_value(catch.bait_used)
        )

        measurement_progress = {}
        current_month_index = now.year * 12 + now.month - 1

        for field in ("weight", "length"):
            points = []
            all_values = []

            for offset in range(5, -1, -1):
                month_index = current_month_index - offset
                year = month_index // 12
                month = month_index % 12 + 1
                values = [
                    getattr(catch, field)
                    for catch in catches
                    if catch.date_caught.year == year
                    and catch.date_caught.month == month
                    and getattr(catch, field) is not None
                    and getattr(catch, field) > 0
                ]
                average = round(sum(values) / len(values), 1) if values else None

                if values:
                    all_values.extend(values)

                points.append({
                    "month": month_abbr[month],
                    "average": average,
                })

            measured_points = [
                point["average"]
                for point in points
                if point["average"] is not None
            ]
            change = None

            if len(measured_points) >= 2:
                change = round(measured_points[-1] - measured_points[0], 1)

            measurement_progress[field] = {
                "average": (
                    round(sum(all_values) / len(all_values), 1)
                    if all_values
                    else None
                ),
                "change": change,
                "points": points,
            }

        return jsonify({
            "species": species,
            "tackle_split": {
                "lure": lure_count,
                "bait": bait_count,
            },
            "size_progress": measurement_progress,
            "monthly_goal": {
                "current": monthly_count,
                "target": 10,
            },
            "milestones": milestones,
        }), 200

    @app.route("/stats/species-playbook", methods=["GET"])
    @premium_required
    def species_playbook(user):
        catches = Catch.query.filter(
            Catch.user_id == user.id,
        ).order_by(
            Catch.date_caught.desc(),
            Catch.id.desc(),
        ).all()
        species_names = {}
        species_counts = Counter()

        for catch in catches:
            species = clean_stat_value(catch.species)

            if species:
                key = species.casefold()
                species_names.setdefault(key, species)
                species_counts[key] += 1

        available_species = [
            {
                "name": species_names[key],
                "count": species_counts[key],
            }
            for key in sorted(
                species_counts,
                key=lambda item: (
                    -species_counts[item],
                    species_names[item].casefold(),
                ),
            )
        ]
        requested_species = clean_stat_value(request.args.get("species"))
        selected_key = requested_species.casefold() if requested_species else None

        if selected_key not in species_counts:
            selected_key = (
                available_species[0]["name"].casefold()
                if available_species
                else None
            )

        if selected_key is None:
            return jsonify({
                "available_species": [],
                "playbook": None,
            }), 200

        selected_catches = [
            catch
            for catch in catches
            if clean_stat_value(catch.species)
            and clean_stat_value(catch.species).casefold() == selected_key
        ]

        def leader(field):
            names = {}
            counts = Counter()

            for catch in selected_catches:
                value = clean_stat_value(getattr(catch, field))

                if value:
                    key = value.casefold()
                    names.setdefault(key, value)
                    counts[key] += 1

            if not counts:
                return None

            key = min(
                counts,
                key=lambda item: (
                    -counts[item],
                    names[item].casefold(),
                ),
            )

            return names[key]

        month_counts = Counter(
            catch.date_caught.month
            for catch in selected_catches
        )
        strongest_month = None

        if month_counts:
            month = min(
                month_counts,
                key=lambda item: (
                    -month_counts[item],
                    item,
                ),
            )
            strongest_month = month_abbr[month]

        weights = [
            catch.weight
            for catch in selected_catches
            if catch.weight is not None and catch.weight > 0
        ]
        lengths = [
            catch.length
            for catch in selected_catches
            if catch.length is not None and catch.length > 0
        ]
        notes = [
            catch.notes
            for catch in selected_catches
            if clean_stat_value(catch.notes)
        ]
        top_lure = leader("lure_used")
        top_bait = leader("bait_used")

        return jsonify({
            "available_species": available_species,
            "playbook": {
                "species": species_names[selected_key],
                "catch_count": len(selected_catches),
                "best_location": leader("location"),
                "top_tackle": top_lure or top_bait,
                "tackle_type": "Lure" if top_lure else "Bait" if top_bait else None,
                "best_tide": leader("tide"),
                "strongest_month": strongest_month,
                "average_weight": (
                    round(sum(weights) / len(weights), 1)
                    if weights
                    else None
                ),
                "best_weight": max(weights, default=None),
                "average_length": (
                    round(sum(lengths) / len(lengths), 1)
                    if lengths
                    else None
                ),
                "private_note_count": len(notes),
                "recent_notes": notes[:2],
            },
        }), 200

    @app.route("/stats/historical-patterns", methods=["GET"])
    @premium_required
    def historical_patterns(user):
        catches = Catch.query.filter(
            Catch.user_id == user.id,
        ).order_by(
            Catch.date_caught.asc(),
            Catch.id.asc(),
        ).all()

        def most_common(field):
            names = {}
            counts = Counter()

            for catch in catches:
                value = clean_stat_value(getattr(catch, field))

                if value:
                    key = value.casefold()
                    names.setdefault(key, value)
                    counts[key] += 1

            if not counts:
                return None

            key = min(
                counts,
                key=lambda item: (
                    -counts[item],
                    names[item].casefold(),
                ),
            )

            return {
                "value": names[key],
                "count": counts[key],
            }

        top_lure = most_common("lure_used")
        top_bait = most_common("bait_used")
        top_tackle = top_lure or top_bait
        tackle_type = "Lure" if top_lure else "Bait" if top_bait else None

        if top_lure and top_bait and top_bait["count"] > top_lure["count"]:
            top_tackle = top_bait
            tackle_type = "Bait"

        temperatures = [
            catch.water_temp
            for catch in catches
            if catch.water_temp is not None
        ]
        temperature_range = None

        if temperatures:
            low = min(temperatures)
            high = max(temperatures)
            temperature_range = (
                f"{display_number(low)}°F"
                if low == high
                else f"{display_number(low)}–{display_number(high)}°F"
            )

        month_counts = Counter(
            catch.date_caught.month
            for catch in catches
        )
        season = None

        if month_counts:
            peak_count = max(month_counts.values())
            peak_months = [
                month
                for month, count in month_counts.items()
                if count == peak_count
            ]
            current_month = datetime.utcnow().month
            peak_month = min(
                peak_months,
                key=lambda month: (month - current_month) % 12,
            )

            season = {
                "peak_month": month_abbr[peak_month],
                "months_until": (peak_month - current_month) % 12,
                "catch_count": peak_count,
                "share": round(peak_count * 100 / len(catches)),
            }

        return jsonify({
            "data_points": len(catches),
            "pattern": {
                "tide": most_common("tide"),
                "tackle": top_tackle,
                "tackle_type": tackle_type,
                "method": most_common("method"),
                "water_temperature": temperature_range,
            },
            "season": season,
        }), 200

    @app.route("/stats/personal-records", methods=["GET"])
    @jwt_required()
    def personal_records():
        catches = Catch.query.filter(
            Catch.user_id == int(get_jwt_identity()),
        ).order_by(
            Catch.date_caught.desc(),
            Catch.id.desc(),
        ).all()

        def measurement_record(field, unit):
            measured = [
                catch
                for catch in catches
                if getattr(catch, field) is not None
            ]

            if not measured:
                return None

            catch = max(
                measured,
                key=lambda row: (
                    getattr(row, field),
                    row.date_caught,
                    row.id,
                ),
            )

            return {
                "catch_id": catch.id,
                "species": clean_stat_value(catch.species),
                "value": getattr(catch, field),
                "unit": unit,
            }

        species_first_catches = {}

        for catch in reversed(catches):
            species = clean_stat_value(catch.species)

            if not species:
                continue

            key = species.casefold()
            current = species_first_catches.get(key)

            if current is None or (
                catch.date_caught,
                catch.id,
            ) < (
                current.date_caught,
                current.id,
            ):
                species_first_catches[key] = catch

        newest_species_catch = max(
            species_first_catches.values(),
            key=lambda row: (
                row.date_caught,
                row.id,
            ),
            default=None,
        )

        newest_species = None

        if newest_species_catch:
            newest_species = {
                "catch_id": newest_species_catch.id,
                "species": clean_stat_value(newest_species_catch.species),
                "date_caught": newest_species_catch.date_caught.date().isoformat(),
            }

        return jsonify({
            "heaviest": measurement_record("weight", "lb"),
            "longest": measurement_record("length", "in"),
            "newest_species": newest_species,
        }), 200

    @app.route("/stats/private-location-notes", methods=["GET"])
    @premium_required
    def private_location_notes(user):
        notes = Catch.query.filter(
            Catch.user_id == user.id,
            Catch.notes.isnot(None),
            db.func.trim(Catch.notes) != "",
        ).order_by(
            Catch.date_caught.desc(),
            Catch.id.desc(),
        ).limit(3).all()

        return jsonify({
            "notes": [
                {
                    "catch_id": catch.id,
                    "date_caught": catch.date_caught.date().isoformat(),
                    "location": clean_stat_value(catch.location),
                    "species": clean_stat_value(catch.species),
                    "bait": clean_stat_value(catch.bait_used),
                    "lure": clean_stat_value(catch.lure_used),
                    "note": catch.notes,
                }
                for catch in notes
            ],
        }), 200

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
                "lure": leaders(rows, "lure_used"),
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


    @app.route("/stats/most-used-lure", methods=["POST", "GET"])
    @app.route("/stats/most-used-bait", methods=["POST", "GET"])
    def most_used_lure():
        response_key = "bait" if request.path.endswith("most-used-bait") else "lure"
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

        # Ignore catches without a lure.
        lure_counts = Counter(
            catch.lure_used
            for catch in current_month_catches
            if catch.lure_used
        )

        if not lure_counts:
            return jsonify({
                response_key: None,
                "count": 0
            }), 200

        most_used, count = lure_counts.most_common(1)[0]

        return jsonify({
            response_key: most_used,
            "count": count
        }), 200
    
