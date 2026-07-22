export type ReputationTier = "newcomer" | "regular" | "contributor" | "legend";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  cover_photo_url: string | null;
  bio: string | null;
  mg_id: string | null;
  plan: string | null;
  vip_status: string | null;
  vip_until: string | null;
  trial_ends_at: string | null;
  role: string | null;
  reputation_score: number | null;
  reputation_tier: ReputationTier | null;
  highlight_badge: string | null;
  profile_flair: string | null;
  gender: string | null;
  onboarded_at: string | null;
  points_balance: number;
  login_streak_count: number;
  invited_by: string | null;
  email_verified_at: string | null;
  identity_verified_at: string | null;
  created_at: string;
  contact_info: string | null;
  skills: string[] | null;
  timezone: string | null;
  language: string | null;
  notif_email: boolean;
  notif_in_app: boolean;
  notif_sound: boolean;
  notif_vibration: boolean;
  notif_room_invite: boolean;
  show_activity_status: boolean;
  show_room_status: boolean;
  allow_dm_from_everyone: boolean;
  allow_unrestricted_messages: boolean;
}

export interface ChatThread {
  id: string;
  title: string;
  status: string;
  is_group: boolean | null;
  community_id: string | null;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  is_public: boolean;
  member_count: number;
  creator_id: string;
}
