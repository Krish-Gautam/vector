export type CircleLevel = 'beginner' | 'intermediate' | 'advanced';
export type MemberRole = 'member' | 'lead';
export type PostType = 'update' | 'win' | 'challenge' | 'question';
export type ActivityType = 'post_created' | 'member_joined' | 'proof_uploaded' | 'task_completed' | 'streak_milestone';

// ── Database row shapes ────────────────────────────────────

export interface ExecutionCircle {
  id: string;
  name: string;
  goal: string;
  duration_months: number;
  current_level: CircleLevel;
  max_size: number;
  member_count: number;
  created_at: string;
  updated_at: string;
  circle_rank?: string | null;
  health_score?: number | null;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  streak_days: number;
  total_points: number;
  last_active_at: string | null;
  // All columns that exist in the actual DB table
  consistency_score: number | null;
  activity_score: number | null;
  accountability_score: number | null;
  circle_rank: string | null;
  weekly_completion_rate: number | null;
  weekly_completion: number | null;
  weekly_activity: number | null;
  last_rematched_at: string | null;
}

export interface CirclePost {
  id: string;
  circle_id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface CircleComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CirclePostLike {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface CircleWeeklyChallenge {
  id: string;
  circle_id: string;
  title: string;
  description: string;
  target_metric: number;
  week_start: string;
  week_end: string;
  created_at: string;
}

export interface CircleChallengeCompletion {
  challenge_id: string;
  user_id: string;
  completed_at: string;
}

export interface CircleActivity {
  id: string;
  circle_id: string;
  user_id: string;
  activity_type: ActivityType;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface CircleActivityWithProfile extends CircleActivity {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

// ── Enriched / joined shapes ───────────────────────────────

export interface CircleMemberWithProfile extends CircleMember {
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export interface CirclePostWithAuthor extends CirclePost {
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  liked_by_me: boolean;
  recent_comments: CircleCommentWithAuthor[];
}

export interface CircleCommentWithAuthor extends CircleComment {
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
}

export interface CircleWeeklyChallengeWithProgress extends CircleWeeklyChallenge {
  completed_count: number;
  completed_by_me: boolean;
}

export interface CircleDetail extends ExecutionCircle {
  members: CircleMemberWithProfile[];
  recent_posts: CirclePostWithAuthor[];
  active_challenge: CircleWeeklyChallengeWithProgress | null;
  health_score: number;
  completed_challenge_by_me: boolean;
  weekly_activity_count: number;
  top_performers: CircleMemberWithProfile[];
}

export interface LeaderboardEntry {
  rank: number;
  member: CircleMemberWithProfile;
  points: number;
  streak_days: number;
}

// ── API Request / Response shapes ─────────────────────────

export interface CreateCircleRequest {
  goal: string;
  duration_months: number;
  current_level: CircleLevel;
}

export interface CreateCircleResponse {
  circle: ExecutionCircle;
  joined: boolean;
}

export interface JoinCircleResponse {
  member: CircleMember;
  circle: ExecutionCircle;
}

export interface CreatePostRequest {
  circle_id: string;
  content: string;
  post_type: PostType;
}

export interface CreatePostResponse {
  post: CirclePost;
}

export interface CreateCommentRequest {
  post_id: string;
  content: string;
}

export interface FeedResponse {
  posts: CirclePostWithAuthor[];
  circle: ExecutionCircle;
  cursor: string | null;
}

export interface AutoMatchResult {
  circle: ExecutionCircle;
  is_new: boolean;
}

export interface ActivityFeedResponse {
  activities: CircleActivityWithProfile[];
}

// ── Frontend state shapes ──────────────────────────────────

export interface ExecutionCirclePageState {
  circle: CircleDetail | null;
  feed: CirclePostWithAuthor[];
  leaderboard: LeaderboardEntry[];
  activeChallenge: CircleWeeklyChallengeWithProgress | null;
  isLoading: boolean;
  isFeedLoading: boolean;
  error: string | null;
  hasJoined: boolean;
}

export type CircleHealthStatus = 'thriving' | 'active' | 'cooling' | 'dormant';

export interface CircleHealthData {
  score: number;
  status: CircleHealthStatus;
  weekly_posts: number;
  active_members: number;
  avg_streak: number;
}

export type CreateCircleInput = CreateCircleRequest;
export type CreatePostInput = CreatePostRequest;
export type CreateCommentInput = CreateCommentRequest;

export interface CircleInsights {
  avg_score: number;
  better_than: number;
  avg_completion: number;
}