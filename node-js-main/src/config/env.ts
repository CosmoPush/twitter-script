import "dotenv/config";
import ms, { type StringValue } from "ms";
import { z } from "zod";

/**
 * Runtime env validation.
 * App MUST crash on startup if config is invalid.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  GET_USER_TWEETS_INTERVAL: z
    .custom<StringValue>()
    .default("30m")
    .refine((v) => typeof ms(v) === "number", {
      message: "Invalid duration format",
    }),

  MAX_PYTHON_PROCESSES: z.coerce.number().default(2),

  TARGET_USER: z.string(),
  MAX_USER_TWEETS: z.coerce.number().default(10),

  DATABASE_URL: z.url(),
});

export const env = envSchema.parse(process.env);
