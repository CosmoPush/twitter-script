import TimelineScraper from "./timelineScraper.js";

const scrapers = new Map<string, TimelineScraper>();

export function syncScrapers(screenNames: string[]) {
  const set = new Set(screenNames);

  // remove deleted users
  for (const key of scrapers.keys()) {
    if (!set.has(key)) {
      scrapers.get(key)?.stop();
      scrapers.delete(key);
      console.log(`[SCRAPER] Removed ${key}`);
    }
  }

  // add new users
  for (const name of screenNames) {
    if (!scrapers.has(name)) {
      scrapers.set(name, new TimelineScraper(name));
      console.log(`[SCRAPER] Added ${name}`);
    }
  }

  return [...scrapers.values()];
}
