import asyncio
import json
import sys
from twikit import Client
from serializers.tweet import serialize_tweet

client = Client("en-US")
client.load_cookies("cookies.json")

async def main():
    if len(sys.argv) < 2:
        print(
            "[ERROR] Missing required argument: tweet_id",
            file=sys.stderr,
        )
        sys.exit(1)

    tweet_id = sys.argv[1]
    print(
        f"[INFO] Start fetching tweet by id: {tweet_id}",
        file=sys.stderr,
    )
    
    try:
        tweet = await client.get_tweet_by_id(tweet_id)
    except Exception as e:
        print(
            f"[ERROR] Failed to fetch tweet {tweet_id}: {e}",
            file=sys.stderr,
        )
        sys.exit(1)

    print(
        f"[INFO] Tweet fetched | id={tweet.id} user={tweet.user.screen_name}",
        file=sys.stderr,
    )

    # Forming a clean JSON object
    result = serialize_tweet(tweet)

    # output only JSON
    print(json.dumps(result))

asyncio.run(main())
