import type { UserResponseDTO } from "./user.dto.js";

export type TweetResponseDTO = {
  id: string;
  text: string;
  created_at: Date;
  lang: string;
  view_count?: number | null;
  reply_count?: number | null;
  retweet_count?: number | null;
  favorite_count?: number | null;
  quote_count?: number | null;
  in_reply_to?: string | null;
  media?: any | null; // Json field
  user: UserResponseDTO;
};

export type TweetDTO = TweetResponseDTO & {
  userId: string;

  // Self-relation for comments
  parent?: TweetDTO | null;
  replies?: TweetDTO[];
};
