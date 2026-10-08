export type UserProfile = {
  id: number;
  username: string;
  first_name?: string | null;
  last_name?: string | null;
  country?: string | null;
  city?: string | null;
  name?: string;
  profile_photo?: string;
  cover_photo?: string;
  location?: string;
  is_following?: boolean;
  catch_count?: number;
  followers_count?: number;
  following_count?: number;
};
