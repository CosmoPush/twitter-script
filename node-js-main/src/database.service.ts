import { EventEmitter } from "node:events";
import { prisma } from "./prisma/index.js";
import type { TweetResponseDTO } from "./dto/tweet.dto.js";
import type { UserResponseDTO } from "./dto/user.dto.js";

export const databaseEmitter = new EventEmitter();

class DatabaseService {
  private async upsertUser(user: UserResponseDTO) {
    const mappedUser = { ...user, created_at: new Date(user.created_at) };

    try {
      const created = await prisma.user.create({ data: mappedUser });
      databaseEmitter.emit("user:created", created);
      return created;
    } catch (e: any) {
      // user already exists → update
      if (e.code === "P2002") {
        return await prisma.user.update({
          where: { id: user.id },
          data: mappedUser,
        });
      }

      throw e;
    }
  }

  async upsertTweet(tweet: TweetResponseDTO) {
    const commonData = {
      ...tweet,
      user: undefined,
      userId: tweet.user.id,
      in_reply_to_fk: tweet.in_reply_to,
      in_reply_to: tweet.in_reply_to,
      created_at: new Date(tweet.created_at),
    };

    try {
      try {
        const created = await prisma.tweet.create({ data: commonData });
        databaseEmitter.emit("tweet:created", created);
        return created;
      } catch (e: any) {
        // FK violation → parent not yet in the database
        if (e.code === "P2003") {
          const created = await prisma.tweet.create({
            data: { ...commonData, in_reply_to_fk: null },
          });
          databaseEmitter.emit("tweet:created", created);
          return created;
        }
        throw e;
      }
    } catch (e: any) {
      // tweet already exists → update
      if (e.code === "P2002") {
        try {
          return await prisma.tweet.update({
            where: { id: tweet.id },
            data: commonData,
          });
        } catch (e: any) {
          // FK violation → parent not yet in the database
          return await prisma.tweet.update({
            where: { id: tweet.id },
            data: { ...commonData, in_reply_to_fk: null },
          });
        }
      }

      throw e;
    }
  }

  async saveOrUpdateTweet(tweet: TweetResponseDTO) {
    await this.upsertUser(tweet.user);
    return this.upsertTweet(tweet);
  }

  async saveOrUpdateManyTweets(tweets: TweetResponseDTO[]) {
    return await Promise.all(tweets.map((t) => this.saveOrUpdateTweet(t)));
  }

  async linkReplyTweets() {
    const result = await prisma.$executeRawUnsafe(`
      UPDATE "Tweet" t
      SET "in_reply_to_fk" = t."in_reply_to"
      FROM "Tweet" parent
      WHERE
        t."in_reply_to_fk" IS NULL
        AND t."in_reply_to" IS NOT NULL
        AND parent."id" = t."in_reply_to"
    `);

    return result;
  }

  async getTwitById(id: string) {
    return await prisma.tweet.findUnique({ where: { id } });
  }
}

export const databaseService = new DatabaseService();
