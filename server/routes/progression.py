def posts_required_for_level(level: int) -> int:
    if level < 2:
        return 1
    elif level < 10:
        return 2
    elif level < 20:
        return 3
    elif level < 30:
        return 4
    else:
        return None


def handle_catch_post(user):
    # Prestige case
    if user.level == 30:
        user.prestige += 1
        user.level = 1
        user.posts_toward_next_level = 0
        return

    required = posts_required_for_level(user.level)
    user.posts_toward_next_level += 1

    if user.posts_toward_next_level >= required:
        user.level += 1
        user.posts_toward_next_level = 0

        if user.level > 30:
            user.prestige += 1
            user.level = 1
