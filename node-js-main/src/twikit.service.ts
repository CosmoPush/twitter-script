import type { TweetResponseDTO } from "./dto/tweet.dto.js";
import type { UserDTO } from "./dto/user.dto.js";
import runPythonScript from "./runPythonScript.js";

class TwikitService {
  private async timedCall<T>(script: string, ...args: any[]): Promise<T> {
    const start = performance.now();
    const result = await runPythonScript(script, ...args);
    const duration = performance.now() - start;
    console.log("Scrape data time:", duration.toFixed(0));
    return result as T;
  }

  getUserTweets(
    username: string,
  ): Promise<{ user: UserDTO; tweets: TweetResponseDTO[] }> {
    return this.timedCall("get_user_tweets", username);
  }

  getTweetById(twitId: string): Promise<TweetResponseDTO> {
    return this.timedCall("get_tweet_by_id", twitId);
  }

  getTweetReplies(
    twitId: string,
  ): Promise<{ root_id: string; tweets: TweetResponseDTO[] }> {
    return this.timedCall("get_tweet_replies", twitId);
  }
}

export const twikitService = new TwikitService();
