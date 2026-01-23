import type { TweetDTO } from "./tweet.dto.js";

export type UserResponseDTO = {
  id: string;
  screen_name: string;
  name: string;
  followers_count: number;
  verified: boolean;
  description?: string | null;
  created_at: string;
};

export type UserDTO = UserResponseDTO & {
  tweets?: TweetDTO[];
};
