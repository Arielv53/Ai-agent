export type CatchComment = {
  id: number;
  content: string;
  timestamp: string;
  user: { id: number; username: string; profile_photo?: string | null };
};

export interface PublicCatch {
  id: number;
  species: string;
  image_url: string;
  caption?: string | null;
  date_caught: string;
  created_at?: string | null;
  location?: string;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  likes_count?: number;
  comments_count?: number;
  liked?: boolean;
  is_following?: boolean;
  comments_preview?: CatchComment[];
  comments_next_cursor?: string | null;
}
