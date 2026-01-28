import PQueue from "p-queue";
import { env } from "./config/env.js";
import { twikitService } from "./twikit.service.js";
import { databaseService } from "./database.service.js";
import { truncateText } from "./utils/truncateText.util.js";
import type { TweetResponseDTO } from "./dto/tweet.dto.js";

const queue = new PQueue({
  concurrency: env.MAX_PYTHON_PROCESSES, // maximum Python processes simultaneously
  interval: 10_000,
  intervalCap: 3,
  carryoverConcurrencyCount: true,
});

export default class TimelineScraper {
  targetUser: string;
  private isRunning = false;

  constructor(targetUser: string) {
    this.targetUser = targetUser;
  }

  stop() {}

  async fetch() {
    if (this.isRunning) {
      console.warn(`[SKIP] ${this.targetUser} already running`);
      return;
    }

    this.isRunning = true;

    try {
      console.log(`[BOOT] Fetching tweets for ${this.targetUser}`);

      const resultUser = await twikitService.getUserTweets(this.targetUser);
      const tweets = resultUser.tweets.slice(0, env.MAX_USER_TWEETS);

      console.log(
        `[INFO] Loaded ${tweets.length} tweets for ${this.targetUser}`,
      );

      for (const tweet of tweets) {
        queue.add(async () => {
          try {
            await this.processTweet(tweet);
          } catch (e) {
            console.error("[FATAL] Queue fetching failed", e);
          }
        });
      }

      await queue.onIdle();
      await databaseService.linkReplyTweets();
      console.log(`[DONE] ${this.targetUser}`);
    } catch (e) {
      console.error(`[ERROR] ${this.targetUser}`, e);
    } finally {
      this.isRunning = false;
    }
  }

  async processTweet(tweet: TweetResponseDTO) {
    console.log(
      `${"=".repeat(20)} [SCRAPE] Fetching replies for tweet ${tweet.id} ${truncateText(tweet.text, 100)}`,
    );

    const result = await twikitService.getTweetReplies(tweet.id);

    console.log(
      `${"=".repeat(20)} [SCRAPE] Done tweet ${tweet.id} ${truncateText(tweet.text, 100)}, replies=${result.tweets.length}`,
    );

    await databaseService.saveOrUpdateManyTweets(result.tweets);

    const linked = await databaseService.linkReplyTweets();
    console.log(`[DB] Linked ${linked} reply tweets`);
  }
}
