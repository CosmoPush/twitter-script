import "dotenv/config";
import { z } from "zod";

/**
 * Runtime env validation.
 * App MUST crash on startup if config is invalid.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  TARGET_USER: z.string(),
  TARGET_TWIT_ID: z.string(),

  DATABASE_URL: z.url(),
});

export const env = envSchema.parse(process.env);
