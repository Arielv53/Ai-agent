import re
import unicodedata

from .extensions import db
from .models import Catch, FishingLocation, SpotGroup


MIN_CATCHES_FOR_REVIEW = 5
MIN_ANGLERS_FOR_REVIEW = 3


def clean_location_text(value, max_length):
    if value is None:
        return None

    if not isinstance(value, str):
        raise ValueError("Location fields must be text")

    cleaned = " ".join(value.split())

    if not cleaned:
        return None

    if len(cleaned) > max_length:
        raise ValueError(f"Location fields must be {max_length} characters or fewer")

    return cleaned


def normalize_location_text(value):
    if not value:
        return ""

    value = unicodedata.normalize("NFKD", value)
    value = "".join(character for character in value if not unicodedata.combining(character))
    value = value.casefold()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


def find_or_create_location(name, user=None, city=None, country=None):
    display_name = clean_location_text(name, 120)

    if not display_name:
        return None

    display_city = clean_location_text(city or getattr(user, "city", None), 100)
    display_country = clean_location_text(
        country or getattr(user, "country", None),
        100,
    )
    normalized_name = normalize_location_text(display_name)
    normalized_city = normalize_location_text(display_city)
    location = FishingLocation.query.filter_by(
        normalized_name=normalized_name,
        normalized_city=normalized_city,
    ).first()

    if location:
        return location

    location = FishingLocation(
        name=display_name,
        normalized_name=normalized_name,
        city=display_city,
        normalized_city=normalized_city,
        country=display_country,
        status="candidate",
        created_by_id=user.id if user else None,
    )
    db.session.add(location)
    db.session.flush()
    return location


def location_activity(location_id):
    catch_count, angler_count = db.session.query(
        db.func.count(Catch.id),
        db.func.count(db.distinct(Catch.user_id)),
    ).filter(Catch.location_id == location_id).one()

    return int(catch_count or 0), int(angler_count or 0)


def refresh_location_status(location):
    if not location or location.status in {"active", "rejected", "archived"}:
        return

    catch_count, angler_count = location_activity(location.id)

    if (
        catch_count >= MIN_CATCHES_FOR_REVIEW
        and angler_count >= MIN_ANGLERS_FOR_REVIEW
    ):
        location.status = "pending"


def attach_catch_location(catch, user, raw_location):
    location = find_or_create_location(raw_location, user=user)
    catch.location = clean_location_text(raw_location, 120)
    catch.location_id = location.id if location else None
    return location


def activate_location(location):
    location.status = "active"

    if not location.spot_group:
        group_name = location.name
        existing_name = SpotGroup.query.filter_by(name=group_name).first()

        if existing_name:
            qualifier = location.city or location.country or str(location.id)
            group_name = f"{location.name} ({qualifier})"

        location.spot_group = SpotGroup(
            name=group_name,
            city=location.city or location.country or "Community location",
            description=(
                f"Trade current fishing reports and local knowledge for {location.name}."
            ),
        )

    db.session.flush()
    return location.spot_group


def serialize_location(location):
    catch_count, angler_count = location_activity(location.id)

    return {
        "id": location.id,
        "name": location.name,
        "city": location.city,
        "state_or_region": location.state_or_region,
        "country": location.country,
        "status": location.status,
        "catch_count": catch_count,
        "unique_angler_count": angler_count,
        "spot_group_id": location.spot_group.id if location.spot_group else None,
    }
