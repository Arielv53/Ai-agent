export type UserProfile = {
  id: number;
  username: string;
  profile_photo?: string;
  level: number;
  prestige: number;
  is_following?: boolean;
  catch_count?: number;
  followers_count?: number;
  following_count?: number;
};