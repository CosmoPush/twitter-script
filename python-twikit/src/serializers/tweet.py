from serializers.user import serialize_user

def serialize_tweet(tweet):
    return {
        "id": tweet.id,
        "text": tweet.text,
        "created_at": str(tweet.created_at),
        "lang": tweet.lang,
        "in_reply_to": tweet.in_reply_to,
        "view_count": int(tweet.view_count or 0),
        "reply_count": int(tweet.reply_count or 0),
        "retweet_count": int(tweet.retweet_count or 0),
        "favorite_count": int(tweet.favorite_count or 0),
        "quote_count": int(tweet.quote_count or 0),

        "user": serialize_user(tweet.user),

        "media": [
            {
                "type": m.type,
                "url": getattr(m, "url", None),
            }
            for m in (tweet.media or [])
        ],
    }