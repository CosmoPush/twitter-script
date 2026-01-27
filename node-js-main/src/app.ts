import ms from "ms";
import { env } from "./config/env.js";
import { databaseEmitter } from "./database.service.js";
import type { TweetDTO } from "./dto/tweet.dto.js";
import type { UserDTO } from "./dto/user.dto.js";
import { timelineScraper } from "./timelineScraper.js";
import timeAgo from "./utils/timeAgo.util.js";
import { truncateText } from "./utils/truncateText.util.js";

(async () => {
  try {
    console.log("[BOOT] Application startup");

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
        `text="${truncateText(tweet.text, 100)}"`,
      );
    };

    databaseEmitter.on("user:created", onCreateUser);
    databaseEmitter.on("tweet:created", onCreateTweet);

    const interval = ms(env.GET_USER_TWEETS_INTERVAL);
    timelineScraper.run(interval);
  } catch (e) {
    console.error("[FATAL] Unhandled error:", e);
  }
})();
