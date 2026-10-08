def parse_user_details(data):
    """Validate optional account details, preserving omitted values on PATCH."""
    details = {}
    for field in ("first_name", "last_name", "country", "city"):
        if field not in data:
            continue
        value = data[field]
        if value is not None and not isinstance(value, str):
            raise ValueError(f"{field.replace('_', ' ').title()} must be text")
        value = value.strip() if value else None
        if value and len(value) > 100:
            raise ValueError(f"{field.replace('_', ' ').title()} must be 100 characters or fewer")
        details[field] = value or None
    return details
