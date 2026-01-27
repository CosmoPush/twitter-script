import PQueue from "p-queue";
import { env } from "./config/env.js";
import { twikitService } from "./twikit.service.js";
import { databaseService } from "./database.service.js";
import { truncateText } from "./utils/truncateText.util.js";

const queue = new PQueue({
  concurrency: env.MAX_PYTHON_PROCESSES, // maximum Python processes simultaneously
  interval: 10_000,
  intervalCap: 3,
  carryoverConcurrencyCount: true,
});

class TimelineScraper {
  interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  run(time = 1000 * 60 * 60) {
    this.fetch();
    this.interval = setInterval(() => this.fetch(), time);
  }

  stop() {
    this.interval && clearInterval(this.interval);
  }

  async fetch() {
    if (this.isRunning) {
      console.warn("[WARN] Fetch skipped: previous cycle still running");
      return;
    }

    this.isRunning = true;

    try {
      console.log("[BOOT] Fetching user tweets");

      const resultUser = await twikitService.getUserTweets(env.TARGET_USER);

      const tweets = resultUser.tweets.slice(0, env.MAX_USER_TWEETS);

      console.log(
        `[INFO] Loaded ${tweets.length} tweets for ${env.TARGET_USER}`,
      );

      for (const tweet of tweets) {
        queue.add(async () => {
          try {
            console.log(
              `${"=".repeat(40)} [SCRAPE] Fetching replies for tweet ${tweet.id} ${truncateText(tweet.text, 100)}`,
            );

            const result = await twikitService.getTweetReplies(tweet.id);

            console.log(
              `${"=".repeat(40)} [SCRAPE] Done tweet ${tweet.id} ${truncateText(tweet.text, 100)}, replies=${result.tweets.length}`,
            );

            await databaseService.saveOrUpdateManyTweets(result.tweets);

            const linked = await databaseService.linkReplyTweets();
            console.log(`[DB] Linked ${linked} reply tweets`);
          } catch (e) {
            console.error("[FATAL] Queue fetching failed", e);
          }
        });
      }

      await queue.onIdle();
      console.log("[INFO] Queue is idle, fetch cycle done");

      const linked = await databaseService.linkReplyTweets();
      console.log(`[DB] Linked ${linked} reply tweets`);
    } catch (e) {
      console.error("[FATAL] Fetch cycle failed", e);
    } finally {
      this.isRunning = false;
    }
  }
}

export const timelineScraper = new TimelineScraper();
