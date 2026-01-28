import { databaseService } from "./database.service.js";
import { syncScrapers } from "./scraperRegistry.js";

export async function runScrapingCycle() {
  const targetUsers = await databaseService.getTargetUsers();

  if (targetUsers.length === 0) {
    console.warn("[WARN] No target users");
    return;
  }

  const scrapers = syncScrapers(
    targetUsers.map((u) => u.screen_name),
  );

  await Promise.allSettled(scrapers.map((s) => s.fetch()));
}
