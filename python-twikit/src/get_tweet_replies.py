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
MAX_DEPTH = 2         # maximum recursion depth to avoid infinite threads
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

async def collect_thread(tweet_id: str, visited=None, depth=0):
    # Recursively collects a tweet and all its replies.
    # Ensures each tweet is processed only once.
    
    if visited is None:
        visited = set()
        
    if tweet_id in visited:
        # print(
        #     f"[DEBUG] Tweet {tweet_id} already processed, skipping",
        #     file=sys.stderr,
        # )
        return []

    if depth > MAX_DEPTH:
        # print(
        #     f"[WARN] Max depth reached ({MAX_DEPTH}) at tweet {tweet_id}",
        #     file=sys.stderr,
        # )
        return []

    visited.add(tweet_id)
    tweet = await safe_get_tweet(tweet_id)
    if not tweet:
        # print(
        #     f"[WARN] Tweet {tweet_id} could not be loaded, skipping branch",
        #     file=sys.stderr,
        # )
        return []
    
    if tweet.retweeted_tweet:
        # print(
        #     f"[INFO] Retweet detected, switching to original tweet {tweet.retweeted_tweet.id}",
        #     file=sys.stderr,
        # )
        tweet = await safe_get_tweet(tweet.retweeted_tweet.id)
        if not tweet:
            return []

    print(
        f"[INFO] Tweet loaded | id={tweet.id} "
        f"depth={depth} "
        f"text=\"{truncate_text(tweet.text, 100)}\"",
        file=sys.stderr,
    )
    
    # Start with the main tweet
    acc = [serialize_tweet(tweet)]

    # Use replies from the object first to reduce extra requests
    replies = tweet.replies or []
    # print(
    #     f"[INFO] Found {len(replies)} direct replies for tweet {tweet.id}",
    #     file=sys.stderr,
    # )
    
    # Recursively fetch replies
    for reply in replies:
        if reply.id not in visited:
            # print(
            #     f"[INFO] Descend into reply | "
            #     f"parent={tweet.id} reply={reply.id} "
            #     f"user={reply.user.screen_name} "
            #     f"depth={depth + 1}",
            #     file=sys.stderr,
            # )
            acc.extend(await collect_thread(reply.id, visited, depth + 1))
   
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
