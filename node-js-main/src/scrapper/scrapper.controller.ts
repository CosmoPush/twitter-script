import { fork, ChildProcess } from "node:child_process";
import path from "node:path";
import type { Request, Response } from "express";

class ScrapperController {
  private scraperProcess: ChildProcess | null = null;

  start = async (_: Request, res: Response) => {
    console.log(this.scraperProcess);
    if (this.scraperProcess) {
      return res.status(409).json({ message: "Scraper already running" });
    }

    const workerPath = path.resolve("./dist/scraper.worker.js");
    console.log(workerPath);

    this.scraperProcess = fork(workerPath, {
      stdio: "inherit",
    });

    this.scraperProcess.on("exit", (code) => {
      console.log("[SERVER] Scraper exited with code", code);
      this.scraperProcess = null;
    });

    res.json({ message: "Scraper started" });
  };

  stop = (_: Request, res: Response) => {
    if (!this.scraperProcess) {
      return res.status(404).json({ message: "Scraper not running" });
    }

    this.scraperProcess.kill("SIGTERM");
    this.scraperProcess = null;

    res.json({ message: "Scraper stopped" });
  };
}

export const scrapperController = new ScrapperController();
