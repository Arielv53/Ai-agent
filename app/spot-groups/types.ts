export type NotificationLevel = "all" | "mentions" | "muted";

export type SpotGroupMessage = {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    profile_photo?: string | null;
  };
};

export type SpotGroup = {
  id: number;
  name: string;
  city: string;
  description?: string | null;
  member_count: number;
  is_joined: boolean;
  notification_level?: NotificationLevel | null;
  latest_message?: SpotGroupMessage | null;
};

export type FishingLocation = {
  id: number;
  name: string;
  city?: string | null;
  state_or_region?: string | null;
  country?: string | null;
  status: "candidate" | "pending" | "active" | "rejected" | "archived";
  catch_count: number;
  unique_angler_count: number;
  spot_group_id?: number | null;
};
