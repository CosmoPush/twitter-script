import asyncio
import json
import sys
from twikit import Client
from twikit.errors import TooManyRequests
from serializers.tweet import serialize_tweet
from utils.truncate_text import truncate_text

client = Client(language="en-US")
client.load_cookies("cookies.json")

REQUEST_DELAY = 4     # seconds between requests
MAX_DEPTH = 10        # maximum recursion depth to avoid infinite threads
MAX_RETRIES = 7       # retries for 429 errors

async def safe_get_tweet(tweet_id: str, retries=MAX_RETRIES):
    for attempt in range(retries):
        try:
            await asyncio.sleep(REQUEST_DELAY)  # throttle requests
            return await client.get_tweet_by_id(tweet_id)
        except TooManyRequests:
            wait = (attempt + 1) * 30
            print(
                f"[WARN] Rate limit reached. Backoff {wait:.1f}s "
                f"(retry {attempt + 1}/{retries})",
                file=sys.stderr,
            )
            await asyncio.sleep(wait)
        except Exception as e:
            print(
                f"[ERROR] Failed to fetch tweet {tweet_id}. Reason: {e}",
                file=sys.stderr,
            )
            return None
    return None

async def collect_thread(tweet_id: str, depth=0):
    if depth > MAX_DEPTH:
        return []

    tweet = await safe_get_tweet(tweet_id)
    if not tweet:
        return []

    # If it's a retweet, take the original.
    if tweet.retweeted_tweet:
        tweet = await safe_get_tweet(tweet.retweeted_tweet.id)
        if not tweet:
            return []

    replies = tweet.replies or []
    
    print(
        f"[INFO] Tweet loaded | id={tweet.id} "
        f"reply_count={tweet.reply_count} "
        f"depth={depth} "
        f"replies_count={len(replies)} "
        f"text=\"{truncate_text(tweet.text, 100)}\"",
        file=sys.stderr,
    )

    acc = []
    acc.append(serialize_tweet(tweet))


    for reply in replies:
        print(
            f"[INFO] Reply loaded | id={reply.id} "
            f"parent={tweet.id} "
            f"depth={depth + 1} "
            f"reply_count={reply.reply_count} "
            f"text=\"{truncate_text(reply.text, 100)}\"",
            file=sys.stderr,
        )

        # Recursion ONLY if replies actually exist
        if reply.reply_count > 0:
            acc.extend(await collect_thread(reply.id, depth + 1))
        else:
            acc.append(serialize_tweet(reply))

    return acc

async def main():
    if len(sys.argv) < 2:
        print("[ERROR] Missing required argument: tweet_id", file=sys.stderr)
        sys.exit(1)

    tweet_id = sys.argv[1]
    
    print(f"[INFO] Start collecting thread for root tweet {tweet_id}", file=sys.stderr)
    thread = await collect_thread(tweet_id)
    
    print(
        f"[INFO] Thread collection finished for root tweet {tweet_id}. Total tweets collected: {len(thread)}",
        file=sys.stderr,
    )
    
    print(json.dumps({
        "root_id": tweet_id,
        "tweets": thread
    }))

if __name__ == "__main__":
    asyncio.run(main())
