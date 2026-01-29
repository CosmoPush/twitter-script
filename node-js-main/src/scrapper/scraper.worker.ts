import ms from "ms";
import { runScrapingCycle } from "./scrapingScheduler.js";
import { env } from "../config/env.js";

const interval = ms(env.GET_USER_TWEETS_INTERVAL);

console.log("[WORKER] Scraper started");

async function loop() {
  while (true) {
    const startedAt = Date.now();

    try {
      await runScrapingCycle();
    } catch (e) {
      console.error("[WORKER] Scraping cycle failed", e);
    }

    const elapsed = Date.now() - startedAt;
    const sleepTime = Math.max(interval - elapsed, 0);

    console.log(`[WORKER] Sleeping ${ms(sleepTime)}`);
    await new Promise((r) => setTimeout(r, sleepTime));
  }
}

loop();
