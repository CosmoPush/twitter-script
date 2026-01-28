import ms from "ms";
import { env } from "./config/env.js";
import { runScrapingCycle } from "./scrapingScheduler.js";

(async function bootstrap() {
  console.log("[BOOT] Application startup");

  const interval = ms(env.GET_USER_TWEETS_INTERVAL);

  while (true) {
    const startedAt = Date.now();

    try {
      await runScrapingCycle();
    } catch (e) {
      console.error("[FATAL] Scraping cycle failed", e);
    }

    const elapsed = Date.now() - startedAt;
    const sleepTime = Math.max(interval - elapsed, 0);

    console.log(`[SCHEDULER] Sleeping ${ms(sleepTime)}`);
    await new Promise((r) => setTimeout(r, sleepTime));
  }
})();
