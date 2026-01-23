def serialize_user(user):
    return {
        "id": user.id,
        "screen_name": user.screen_name,
        "name": user.name,
        "followers_count": int(user.followers_count or 0),
        "verified": user.verified,
        "description": user.description,
        "created_at": str(user.created_at),
    }