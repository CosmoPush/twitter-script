import asyncio
import json
import sys
from twikit import Client
from serializers.user import serialize_user
from serializers.tweet import serialize_tweet

client = Client("en-US")
client.load_cookies("cookies.json")

async def main():
    if len(sys.argv) < 2:
        print(
            "[ERROR] Missing required argument: user_screen_name",
            file=sys.stderr,
        )
        sys.exit(1)

    user_screen_name = sys.argv[1]
    print(
        f"[INFO] Start fetching data for user @{user_screen_name}",
        file=sys.stderr,
    )
    
    try:
        user = await client.get_user_by_screen_name(user_screen_name)
    except Exception as e:
        print(
            f"[ERROR] Failed to fetch user @{user_screen_name}: {e}",
            file=sys.stderr,
        )
        sys.exit(1)

    print(
        f"[INFO] User loaded | id={user.id} screen_name={user.screen_name}",
        file=sys.stderr,
    )
    
    try:
        tweets = await client.get_user_tweets(user.id, tweet_type="Tweets")
    except Exception as e:
        print(
            f"[ERROR] Failed to fetch tweets for user {user.id}: {e}",
            file=sys.stderr,
        )
        sys.exit(1)

    print(
        f"[INFO] Tweets fetched for user {user.screen_name} {user.id}: {len(tweets)}",
        file=sys.stderr,
    )

    # Forming a clean JSON object
    result = {
        "user": serialize_user(user),
        "tweets": [serialize_tweet(tweet) for tweet in tweets],
    }

    # output only JSON
    print(json.dumps(result))

asyncio.run(main())
