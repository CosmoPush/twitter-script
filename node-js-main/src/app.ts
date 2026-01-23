import { twikitService } from "./twikit.service.js";
import { databaseEmitter, databaseService } from "./database.service.js";
import { prisma } from "./prisma/index.js";
import type { TweetDTO } from "./dto/tweet.dto.js";
import timeAgo from "./utils/timeAgo.util.js";
import { env } from "./config/env.js";
import type { UserDTO } from "./dto/user.dto.js";
import { truncateText } from "./utils/truncateText.util.js";

(async () => {
  try {
    console.log("[BOOT] Application startup");

    const targetTwitId = env.TARGET_TWIT_ID;
    console.log("[CONFIG] Target tweet id:", targetTwitId);

    const onCreateUser = (user: UserDTO) => {
      console.log(
        "[DB] User created",
        `id=${user.id}`,
        `screen_name=${user.screen_name}`,
      );
    };

    const onCreateTweet = (tweet: TweetDTO) => {
      const time = timeAgo(tweet.created_at);
      console.log(
        "[DB] Tweet created",
        `id=${tweet.id}`,
        `time=${time}`,
        `text="${truncateText(tweet.text)}"`,
      );
    };

    databaseEmitter.on("user:created", onCreateUser);
    databaseEmitter.on("tweet:created", onCreateTweet);

    console.log("[SCRAPE] Fetching tweet replies");
    const result = await twikitService.getTweetReplies(targetTwitId);
    console.log("[SCRAPE] Replies fetched:", result.tweets.length);

    const s = performance.now();
    console.log("[DB] Persisting tweets to database");
    await databaseService.saveOrUpdateManyTweets(result.tweets);
    const d = performance.now() - s;
    console.log("[DB] Persistence completed in", d.toFixed(0), "ms");

    await prisma.$disconnect();
    console.log("[SHUTDOWN] Application finished");
  } catch (e) {
    console.error("[FATAL] Unhandled error:", e);
  }
})();
