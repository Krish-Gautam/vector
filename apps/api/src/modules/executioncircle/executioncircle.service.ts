























// import { SupabaseClient } from '@supabase/supabase-js';
// import {
//   ExecutionCircle,
//   CircleMember,
//   CirclePost,
//   CircleComment,
//   CircleDetail,
//   CircleMemberWithProfile,
//   CirclePostWithAuthor,
//   CircleCommentWithAuthor,
//   CircleWeeklyChallengeWithProgress,
//   AutoMatchResult,
//   CircleHealthData,
//   CircleHealthStatus,
//   CreateCircleInput,
//   CreatePostInput,
//   CreateCommentInput,
//   CircleActivityWithProfile,
// } from '../../shared/types/executioncircle.types.js';

// export type { CreateCircleInput, CreatePostInput, CreateCommentInput };

// function computeHealthStatus(score: number): CircleHealthStatus {
//   if (score >= 75) return 'thriving';
//   if (score >= 50) return 'active';
//   if (score >= 25) return 'cooling';
//   return 'dormant';
// }

// function computeCircleName(goal: string, level: string, index: number): string {
//   const levelLabel =
//     level === 'beginner' ? 'Rising' : level === 'intermediate' ? 'Growth' : 'Elite';
//   const shortGoal = goal
//     .split(' ')
//     .slice(0, 2)
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(' ');
//   return `${levelLabel} ${shortGoal} Circle #${index}`;
// }

// export class ExecutionCircleService {
//   constructor(private readonly supabase: SupabaseClient) {}

//   // ── Auto-match ──────────────────────────────────────────

//   async autoMatchCircle(
//     userId: string,
//     goal: string,
//     durationMonths: number,
//     currentLevel: string,
//   ): Promise<AutoMatchResult> {
//     const { data: existingMembership } = await this.supabase
//       .from('circle_members')
//       .select('circle_id')
//       .eq('user_id', userId)
//       .maybeSingle();

//     if (existingMembership?.circle_id) {
//       const { data: circle } = await this.supabase
//         .from('execution_circles')
//         .select('*')
//         .eq('id', existingMembership.circle_id)
//         .single();
//       return { circle: circle as ExecutionCircle, is_new: false };
//     }

//     const { data: matchingCircles } = await this.supabase
//       .from('execution_circles')
//       .select('*')
//       .eq('goal', goal)
//       .eq('duration_months', durationMonths)
//       .eq('current_level', currentLevel)
//       .order('member_count', { ascending: false });

//     const availableCircle = (matchingCircles ?? []).find(
//       (c: ExecutionCircle) => c.member_count < c.max_size,
//     );

//     if (availableCircle) {
//       await this.addMember(availableCircle.id, userId);
//       return { circle: availableCircle as ExecutionCircle, is_new: false };
//     }

//     const existingCount = (matchingCircles ?? []).length;

//     const { data: newCircle, error } = await this.supabase
//       .from('execution_circles')
//       .insert({
//         name: computeCircleName(goal, currentLevel, existingCount + 1),
//         goal,
//         duration_months: durationMonths,
//         current_level: currentLevel,
//         max_size: 999,
//         member_count: 0,
//       })
//       .select()
//       .single();

//     if (error || !newCircle) throw new Error(error?.message ?? 'Failed to create circle');

//     await this.addMember(newCircle.id, userId, 'lead');
//     return { circle: newCircle as ExecutionCircle, is_new: true };
//   }

//   // ── Member management ───────────────────────────────────

//   private async addMember(
//     circleId: string,
//     userId: string,
//     role: 'member' | 'lead' = 'member',
//   ): Promise<CircleMember> {
//     const { data, error } = await this.supabase
//       .from('circle_members')
//       .insert({ circle_id: circleId, user_id: userId, role })
//       .select()
//       .single();

//     if (error || !data) throw new Error(error?.message ?? 'Failed to add member');

//     const { data: circle } = await this.supabase
//       .from('execution_circles')
//       .select('member_count')
//       .eq('id', circleId)
//       .single();

//     await this.supabase
//       .from('execution_circles')
//       .update({ member_count: (circle?.member_count || 0) + 1 })
//       .eq('id', circleId);

//     return data as CircleMember;
//   }

//   async joinCircle(
//     circleId: string,
//     userId: string,
//   ): Promise<{ member: CircleMember; circle: ExecutionCircle }> {
//     const { data: existing } = await this.supabase
//       .from('circle_members')
//       .select('id')
//       .eq('circle_id', circleId)
//       .eq('user_id', userId)
//       .maybeSingle();

//     if (existing) throw new Error('Already a member of this circle');

//     const member = await this.addMember(circleId, userId);

//     const { data: circle } = await this.supabase
//       .from('execution_circles')
//       .select('*')
//       .eq('id', circleId)
//       .single();

//     return { member, circle: circle as ExecutionCircle };
//   }

//   // ── Circle detail ────────────────────────────────────────

//   async getCircleDetail(circleId: string, requestingUserId: string): Promise<CircleDetail> {
//     const [circleRes, membersRes, postsRes, challengeRes] = await Promise.all([
//       this.supabase.from('execution_circles').select('*').eq('id', circleId).single(),
//       this.getCircleMembers(circleId),
//       this.getCirclePosts(circleId, requestingUserId, 10),
//       this.getActiveChallenge(circleId, requestingUserId),
//     ]);

//     if (circleRes.error || !circleRes.data) {
//       throw new Error(circleRes.error?.message ?? 'Circle not found');
//     }

//     const circle = circleRes.data as ExecutionCircle;
//     const members = membersRes;
//     const recentPosts = postsRes;
//     const activeChallenge = challengeRes;

//     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
//     const weeklyPosts = recentPosts.filter(
//       (p) => new Date(p.created_at) >= new Date(sevenDaysAgo),
//     ).length;
//     const activeMembers = members.filter(
//       (m) => m.last_active_at && new Date(m.last_active_at) >= new Date(sevenDaysAgo),
//     ).length;
//     const avgStreak =
//       members.length > 0
//         ? Math.round(members.reduce((sum, m) => sum + m.streak_days, 0) / members.length)
//         : 0;

//     const participationRate =
//       members.length > 0 ? (activeMembers / members.length) * 100 : 0;
//     const postRate = Math.min((weeklyPosts / Math.max(members.length, 1)) * 20, 40);
//     const streakBonus = Math.min(avgStreak * 2, 20);
//     const challengeBonus = activeChallenge?.completed_by_me ? 20 : 0;
//     const healthScore = Math.round(
//       Math.min(participationRate * 0.4 + postRate + streakBonus + challengeBonus, 100),
//     );

//     const topPerformers = [...members]
//       .sort((a, b) => b.total_points - a.total_points)
//       .slice(0, 3);

//     return {
//       ...circle,
//       members,
//       recent_posts: recentPosts,
//       active_challenge: activeChallenge,
//       health_score: healthScore,
//       weekly_activity_count: weeklyPosts,
//       top_performers: topPerformers,
//     };
//   }

//   async getCircleHealth(circleId: string): Promise<CircleHealthData> {
//     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

//     const [membersRes, postsRes] = await Promise.all([
//       this.supabase
//         .from('circle_members')
//         .select('streak_days, last_active_at')
//         .eq('circle_id', circleId),
//       this.supabase
//         .from('circle_posts')
//         .select('id', { count: 'exact' })
//         .eq('circle_id', circleId)
//         .gte('created_at', sevenDaysAgo),
//     ]);

//     const members = membersRes.data ?? [];
//     const weeklyPosts = postsRes.count ?? 0;
//     const activeMembers = members.filter(
//       (m: any) => m.last_active_at && new Date(m.last_active_at) >= new Date(sevenDaysAgo),
//     ).length;
//     const avgStreak =
//       members.length > 0
//         ? Math.round(
//             members.reduce((sum: number, m: any) => sum + m.streak_days, 0) / members.length,
//           )
//         : 0;

//     const participationRate =
//       members.length > 0 ? (activeMembers / members.length) * 100 : 0;
//     const postRate = Math.min((weeklyPosts / Math.max(members.length, 1)) * 20, 40);
//     const streakBonus = Math.min(avgStreak * 2, 20);
//     const score = Math.round(
//       Math.min(participationRate * 0.4 + postRate + streakBonus, 100),
//     );

//     return {
//       score,
//       status: computeHealthStatus(score),
//       weekly_posts: weeklyPosts,
//       active_members: activeMembers,
//       avg_streak: avgStreak,
//     };
//   }

//   // ── Members ──────────────────────────────────────────────

//   private async getCircleMembers(circleId: string): Promise<CircleMemberWithProfile[]> {
//     const { data: members, error } = await this.supabase
//       .from('circle_members')
//       .select('*')
//       .eq('circle_id', circleId)
//       .order('total_points', { ascending: false });

//     if (error) throw new Error(error.message);
//     if (!members || members.length === 0) return [];

//     const userIds = members.map((m) => m.user_id);
//     const { data: profiles } = await this.supabase
//       .from('profiles')
//       .select('id, full_name, avatar_url, username')
//       .in('id', userIds);

//     const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

//     return members.map((m) => ({
//       ...m,
//       profile: profileMap.get(m.user_id) || {
//         id: m.user_id,
//         full_name: null,
//         avatar_url: null,
//         username: null,
//       },
//     })) as CircleMemberWithProfile[];
//   }

//   async getLeaderboard(circleId: string) {
//     const members = await this.getCircleMembers(circleId);
//     return members
//       .sort((a, b) => b.total_points - a.total_points)
//       .map((member, idx) => ({
//         rank: idx + 1,
//         member,
//         points: member.total_points,
//         streak_days: member.streak_days,
//       }));
//   }

//   // ── Posts ────────────────────────────────────────────────

//   private async getCirclePosts(
//     circleId: string,
//     requestingUserId: string,
//     limit = 20,
//     cursor?: string,
//   ): Promise<CirclePostWithAuthor[]> {
//     let query = this.supabase
//       .from('circle_posts')
//       .select('*')
//       .eq('circle_id', circleId)
//       .order('created_at', { ascending: false })
//       .limit(limit);

//     if (cursor) {
//       query = query.lt('created_at', cursor);
//     }

//     const { data, error } = await query;
//     if (error) throw new Error(error.message);

//     const posts = (data ?? []) as any[];
//     if (posts.length === 0) return [];

//     const postIds = posts.map((p) => p.id);
//     const { data: likes } = await this.supabase
//       .from('circle_post_likes')
//       .select('post_id')
//       .eq('user_id', requestingUserId)
//       .in('post_id', postIds);

//     const likedSet = new Set((likes ?? []).map((l: any) => l.post_id));

//     const postUserIds = [...new Set(posts.map((p) => p.user_id))];
//     const { data: postProfiles } = await this.supabase
//       .from('profiles')
//       .select('id, full_name, avatar_url, username')
//       .in('id', postUserIds);
//     const postProfileMap = new Map(postProfiles?.map((p) => [p.id, p]) || []);

//     const enriched: CirclePostWithAuthor[] = await Promise.all(
//       posts.map(async (post) => {
//         const { data: comments } = await this.supabase
//           .from('circle_comments')
//           .select('*')
//           .eq('post_id', post.id)
//           .order('created_at', { ascending: true })
//           .limit(3);

//         const safeComments = comments || [];
//         const commentUserIds = [...new Set(safeComments.map((c) => c.user_id))];
//         const { data: commentProfiles } = await this.supabase
//           .from('profiles')
//           .select('id, full_name, avatar_url, username')
//           .in(
//             'id',
//             commentUserIds.length > 0
//               ? commentUserIds
//               : ['00000000-0000-0000-0000-000000000000'],
//           );
//         const commentProfileMap = new Map(
//           commentProfiles?.map((p) => [p.id, p]) || [],
//         );

//         const enrichedComments = safeComments.map((c) => ({
//           ...c,
//           author: commentProfileMap.get(c.user_id) || {
//             id: c.user_id,
//             full_name: null,
//             avatar_url: null,
//             username: null,
//           },
//         }));

//         return {
//           ...post,
//           author: postProfileMap.get(post.user_id) || {
//             id: post.user_id,
//             full_name: null,
//             avatar_url: null,
//             username: null,
//           },
//           liked_by_me: likedSet.has(post.id),
//           recent_comments: enrichedComments as CircleCommentWithAuthor[],
//         } as CirclePostWithAuthor;
//       }),
//     );

//     return enriched;
//   }

//   async getFeed(
//     circleId: string,
//     requestingUserId: string,
//     limit = 20,
//     cursor?: string,
//   ) {
//     const posts = await this.getCirclePosts(circleId, requestingUserId, limit, cursor);

//     const { data: circle } = await this.supabase
//       .from('execution_circles')
//       .select('*')
//       .eq('id', circleId)
//       .single();

//     return {
//       posts,
//       circle,
//       cursor: posts.length === limit ? posts[posts.length - 1]?.created_at : null,
//     };
//   }

//   async createPost(input: CreatePostInput, userId: string): Promise<CirclePost> {
//     const { data, error } = await this.supabase
//       .from('circle_posts')
//       .insert({
//         circle_id: input.circle_id,
//         user_id: userId,
//         content: input.content,
//         post_type: input.post_type,
//       })
//       .select()
//       .single();

//     if (error || !data) throw new Error(error?.message ?? 'Failed to create post');

//     await this.supabase
//       .from('circle_members')
//       .update({ last_active_at: new Date().toISOString() })
//       .eq('circle_id', input.circle_id)
//       .eq('user_id', userId);

//     return data as CirclePost;
//   }

//   async createComment(input: CreateCommentInput, userId: string): Promise<CircleComment> {
//     const { data, error } = await this.supabase
//       .from('circle_comments')
//       .insert({
//         post_id: input.post_id,
//         user_id: userId,
//         content: input.content,
//       })
//       .select()
//       .single();

//     if (error || !data) throw new Error(error?.message ?? 'Failed to create comment');

//     // Log activity — get circle_id from the post
//     const { data: post } = await this.supabase
//       .from('circle_posts')
//       .select('circle_id')
//       .eq('id', input.post_id)
//       .single();

//     if (post?.circle_id) {
//       await this.supabase.from('circle_activity').insert({
//         circle_id: post.circle_id,
//         user_id: userId,
//         activity_type: 'post_created',
//         metadata: { post_id: input.post_id, action: 'commented' },
//       });
//     }

//     return data as CircleComment;
//   }

//   // FIXED: toggleLike now returns updated likes_count
//   async toggleLike(
//     postId: string,
//     userId: string,
//   ): Promise<{ liked: boolean; likes_count: number }> {
//     const { data: existing } = await this.supabase
//       .from('circle_post_likes')
//       .select('post_id')
//       .eq('post_id', postId)
//       .eq('user_id', userId)
//       .maybeSingle();

//     if (existing) {
//       await this.supabase
//         .from('circle_post_likes')
//         .delete()
//         .eq('post_id', postId)
//         .eq('user_id', userId);
//     } else {
//       await this.supabase
//         .from('circle_post_likes')
//         .insert({ post_id: postId, user_id: userId });
//     }

//     // The DB trigger updates likes_count automatically.
//     // Fetch the updated count to return to frontend for optimistic UI.
//     const { data: updatedPost } = await this.supabase
//       .from('circle_posts')
//       .select('likes_count')
//       .eq('id', postId)
//       .single();

//     return {
//       liked: !existing,
//       likes_count: updatedPost?.likes_count ?? 0,
//     };
//   }

//   // ── Weekly Challenge ─────────────────────────────────────

//   private async getActiveChallenge(
//     circleId: string,
//     userId: string,
//   ): Promise<CircleWeeklyChallengeWithProgress | null> {
//     const today = new Date().toISOString().split('T')[0];

//     const { data: challenge } = await this.supabase
//       .from('circle_weekly_challenges')
//       .select('*')
//       .eq('circle_id', circleId)
//       .lte('week_start', today)
//       .gte('week_end', today)
//       .maybeSingle();

//     if (!challenge) return null;

//     const { count: completedCount } = await this.supabase
//       .from('circle_challenge_completions')
//       .select('*', { count: 'exact', head: true })
//       .eq('challenge_id', challenge.id);

//     const { data: myCompletion } = await this.supabase
//       .from('circle_challenge_completions')
//       .select('challenge_id')
//       .eq('challenge_id', challenge.id)
//       .eq('user_id', userId)
//       .maybeSingle();

//     return {
//       ...challenge,
//       completed_count: completedCount ?? 0,
//       completed_by_me: !!myCompletion,
//     } as CircleWeeklyChallengeWithProgress;
//   }

//   async completeChallenge(challengeId: string, userId: string): Promise<void> {
//     const { error } = await this.supabase
//       .from('circle_challenge_completions')
//       .insert({ challenge_id: challengeId, user_id: userId });

//     if (error) throw new Error(error.message);

//     const { error: rpcError } = await this.supabase.rpc('increment_member_points', {
//       p_challenge_id: challengeId,
//       p_user_id: userId,
//       p_points: 50,
//     });

//     if (rpcError) throw new Error(rpcError.message);

//     const { data: member } = await this.supabase
//       .from('circle_members')
//       .select('id, accountability_score')
//       .eq('user_id', userId)
//       .maybeSingle();

//     if (member) {
//       await this.supabase
//         .from('circle_members')
//         .update({ accountability_score: (member.accountability_score || 0) + 5 })
//         .eq('id', member.id);
//     }
//   }

//   // ── Circle Activity (NEW) ────────────────────────────────

//   async getCircleActivity(
//     circleId: string,
//     limit = 10,
//   ): Promise<CircleActivityWithProfile[]> {
//     const { data: activities, error } = await this.supabase
//       .from('circle_activity')
//       .select('*')
//       .eq('circle_id', circleId)
//       .order('created_at', { ascending: false })
//       .limit(limit);

//     if (error) throw new Error(error.message);
//     if (!activities || activities.length === 0) return [];

//     const userIds = [...new Set(activities.map((a) => a.user_id))];
//     const { data: profiles } = await this.supabase
//       .from('profiles')
//       .select('id, full_name, avatar_url, username')
//       .in('id', userIds);

//     const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

//     return activities.map((a) => ({
//       ...a,
//       profile: profileMap.get(a.user_id) || {
//         id: a.user_id,
//         full_name: null,
//         avatar_url: null,
//         username: null,
//       },
//     })) as CircleActivityWithProfile[];
//   }

//   // ── My circle ────────────────────────────────────────────

//   async getUserCircle(userId: string): Promise<ExecutionCircle | null> {
//     const { data } = await this.supabase
//       .from('circle_members')
//       .select('circle_id')
//       .eq('user_id', userId)
//       .maybeSingle();

//     if (!data?.circle_id) return null;

//     const { data: circle } = await this.supabase
//       .from('execution_circles')
//       .select('*')
//       .eq('id', data.circle_id)
//       .single();

//     return circle as ExecutionCircle | null;
//   }

//   // ── Upload Proof ─────────────────────────────────────────

//   async uploadProof(
//     userId: string,
//     circleId: string,
//     imageUrl: string,
//     description: string,
//   ) {
//     const { data: proof, error: proofError } = await this.supabase
//       .from('proof_uploads')
//       .insert({
//         user_id: userId,
//         circle_id: circleId,
//         file_url: imageUrl,
//         description: description || '',
//       })
//       .select()
//       .single();

//     if (proofError) throw new Error(`Proof insert failed: ${proofError.message}`);

//     const postContent = `📸 Uploaded proof: ${description || 'Activity completed!'}\n\n[IMAGE:${imageUrl}]`;
//     await this.createPost(
//       { circle_id: circleId, content: postContent, post_type: 'win' },
//       userId,
//     );

//     const { data: member } = await this.supabase
//       .from('circle_members')
//       .select('id, accountability_score')
//       .eq('user_id', userId)
//       .eq('circle_id', circleId)
//       .maybeSingle();

//     if (member) {
//       await this.supabase
//         .from('circle_members')
//         .update({
//           accountability_score: (member.accountability_score || 0) + 3,
//           last_active_at: new Date().toISOString(),
//         })
//         .eq('id', member.id);
//     }

//     await this.supabase.from('activity_logs').insert({
//       user_id: userId,
//       metadata_json: { type: 'proof_uploaded', proof_id: proof.id, circle_id: circleId },
//     });

//     // Also log to circle_activity
//     await this.supabase.from('circle_activity').insert({
//       circle_id: circleId,
//       user_id: userId,
//       activity_type: 'proof_uploaded',
//       metadata: { proof_id: proof.id, description },
//     });

//     return proof;
//   }

//   // ── Request Circle Change ────────────────────────────────

//   async requestCircleChange(
//     userId: string,
//     circleId: string,
//     reason: string,
//   ): Promise<{ success: boolean }> {
//     const { error } = await this.supabase
//       .from('circle_change_requests')
//       .insert({ user_id: userId, current_circle_id: circleId, reason });

//     if (error) throw new Error(error.message);
//     return { success: true };
//   }
// }


























import { SupabaseClient } from '@supabase/supabase-js';
import {
  ExecutionCircle,
  CircleMember,
  CirclePost,
  CircleComment,
  CircleDetail,
  CircleMemberWithProfile,
  CirclePostWithAuthor,
  CircleCommentWithAuthor,
  CircleWeeklyChallengeWithProgress,
  AutoMatchResult,
  CircleHealthData,
  CircleHealthStatus,
  CreateCircleInput,
  CreatePostInput,
  CreateCommentInput,
  CircleActivityWithProfile,
} from '../../shared/types/executioncircle.types.js';

export type { CreateCircleInput, CreatePostInput, CreateCommentInput };

function computeHealthStatus(score: number): CircleHealthStatus {
  if (score >= 75) return 'thriving';
  if (score >= 50) return 'active';
  if (score >= 25) return 'cooling';
  return 'dormant';
}

function computeCircleName(goal: string, level: string, index: number): string {
  const levelLabel =
    level === 'beginner' ? 'Rising' : level === 'intermediate' ? 'Growth' : 'Elite';
  const shortGoal = goal
    .split(' ')
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${levelLabel} ${shortGoal} Circle #${index}`;
}

export class ExecutionCircleService {
  constructor(private readonly supabase: SupabaseClient) {}

  // ── Auto-match ──────────────────────────────────────────

  async autoMatchCircle(
    userId: string,
    goal: string,
    durationMonths: number,
    currentLevel: string,
  ): Promise<AutoMatchResult> {
    const { data: existingMembership } = await this.supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMembership?.circle_id) {
      const { data: circle } = await this.supabase
        .from('execution_circles')
        .select('*')
        .eq('id', existingMembership.circle_id)
        .single();
      return { circle: circle as ExecutionCircle, is_new: false };
    }

    const { data: matchingCircles } = await this.supabase
      .from('execution_circles')
      .select('*')
      .eq('goal', goal)
      .eq('duration_months', durationMonths)
      .eq('current_level', currentLevel)
      .order('member_count', { ascending: false });

    const availableCircle = (matchingCircles ?? []).find(
      (c: ExecutionCircle) => c.member_count < c.max_size,
    );

    if (availableCircle) {
      await this.addMember(availableCircle.id, userId);
      return { circle: availableCircle as ExecutionCircle, is_new: false };
    }

    const existingCount = (matchingCircles ?? []).length;

    const { data: newCircle, error } = await this.supabase
      .from('execution_circles')
      .insert({
        name: computeCircleName(goal, currentLevel, existingCount + 1),
        goal,
        duration_months: durationMonths,
        current_level: currentLevel,
        max_size: 999,
        member_count: 0,
      })
      .select()
      .single();

    if (error || !newCircle) throw new Error(error?.message ?? 'Failed to create circle');

    await this.addMember(newCircle.id, userId, 'lead');
    return { circle: newCircle as ExecutionCircle, is_new: true };
  }

  // ── Member management ───────────────────────────────────

  private async addMember(
    circleId: string,
    userId: string,
    role: 'member' | 'lead' = 'member',
  ): Promise<CircleMember> {
    const { data, error } = await this.supabase
      .from('circle_members')
      .insert({ circle_id: circleId, user_id: userId, role })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to add member');

    const { data: circle } = await this.supabase
      .from('execution_circles')
      .select('member_count')
      .eq('id', circleId)
      .single();

    await this.supabase
      .from('execution_circles')
      .update({ member_count: (circle?.member_count || 0) + 1 })
      .eq('id', circleId);

    return data as CircleMember;
  }

  async joinCircle(
    circleId: string,
    userId: string,
  ): Promise<{ member: CircleMember; circle: ExecutionCircle }> {
    const { data: existing } = await this.supabase
      .from('circle_members')
      .select('id')
      .eq('circle_id', circleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) throw new Error('Already a member of this circle');

    const member = await this.addMember(circleId, userId);

    const { data: circle } = await this.supabase
      .from('execution_circles')
      .select('*')
      .eq('id', circleId)
      .single();

    return { member, circle: circle as ExecutionCircle };
  }

  // ── Circle detail ────────────────────────────────────────

  async getCircleDetail(circleId: string, requestingUserId: string): Promise<CircleDetail> {
    const [circleRes, membersRes, postsRes, challengeRes] = await Promise.all([
      this.supabase.from('execution_circles').select('*').eq('id', circleId).single(),
      this.getCircleMembers(circleId),
      this.getCirclePosts(circleId, requestingUserId, 10),
      this.getActiveChallenge(circleId, requestingUserId),
    ]);

    if (circleRes.error || !circleRes.data) {
      throw new Error(circleRes.error?.message ?? 'Circle not found');
    }

    const circle = circleRes.data as ExecutionCircle;
    const members = membersRes;
    const recentPosts = postsRes;
    const activeChallenge = challengeRes;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const weeklyPosts = recentPosts.filter(
      (p) => new Date(p.created_at) >= new Date(sevenDaysAgo),
    ).length;
    const activeMembers = members.filter(
      (m) => m.last_active_at && new Date(m.last_active_at) >= new Date(sevenDaysAgo),
    ).length;
    const avgStreak =
      members.length > 0
        ? Math.round(members.reduce((sum, m) => sum + m.streak_days, 0) / members.length)
        : 0;

    const participationRate =
      members.length > 0 ? (activeMembers / members.length) * 100 : 0;
    const postRate = Math.min((weeklyPosts / Math.max(members.length, 1)) * 20, 40);
    const streakBonus = Math.min(avgStreak * 2, 20);
    const challengeBonus = activeChallenge?.completed_by_me ? 20 : 0;
    const healthScore = Math.round(
      Math.min(participationRate * 0.4 + postRate + streakBonus + challengeBonus, 100),
    );

    const topPerformers = [...members]
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, 3);

    return {
      ...circle,
      members,
      recent_posts: recentPosts,
      active_challenge: activeChallenge,
      health_score: healthScore,
      weekly_activity_count: weeklyPosts,
      top_performers: topPerformers,
    };
  }

  async getCircleHealth(circleId: string): Promise<CircleHealthData> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [membersRes, postsRes] = await Promise.all([
      this.supabase
        .from('circle_members')
        .select('streak_days, last_active_at')
        .eq('circle_id', circleId),
      this.supabase
        .from('circle_posts')
        .select('id', { count: 'exact' })
        .eq('circle_id', circleId)
        .gte('created_at', sevenDaysAgo),
    ]);

    const members = membersRes.data ?? [];
    const weeklyPosts = postsRes.count ?? 0;
    const activeMembers = members.filter(
      (m: any) => m.last_active_at && new Date(m.last_active_at) >= new Date(sevenDaysAgo),
    ).length;
    const avgStreak =
      members.length > 0
        ? Math.round(
            members.reduce((sum: number, m: any) => sum + m.streak_days, 0) / members.length,
          )
        : 0;

    const participationRate =
      members.length > 0 ? (activeMembers / members.length) * 100 : 0;
    const postRate = Math.min((weeklyPosts / Math.max(members.length, 1)) * 20, 40);
    const streakBonus = Math.min(avgStreak * 2, 20);
    const score = Math.round(
      Math.min(participationRate * 0.4 + postRate + streakBonus, 100),
    );

    return {
      score,
      status: computeHealthStatus(score),
      weekly_posts: weeklyPosts,
      active_members: activeMembers,
      avg_streak: avgStreak,
    };
  }

  // ── Members ──────────────────────────────────────────────

  private async getCircleMembers(circleId: string): Promise<CircleMemberWithProfile[]> {
    const { data: members, error } = await this.supabase
      .from('circle_members')
      .select('*')
      .eq('circle_id', circleId)
      .order('total_points', { ascending: false });

    if (error) throw new Error(error.message);
    if (!members || members.length === 0) return [];

    const userIds = members.map((m) => m.user_id);
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    return members.map((m) => {
      const p = profileMap.get(m.user_id);
      return {
        ...m,
        profile: p 
          ? { ...p, full_name: p.full_name || p.username } // FIX: Fallback to username
          : { id: m.user_id, full_name: 'Unknown', avatar_url: null, username: 'unknown' }
      };
    }) as CircleMemberWithProfile[];
  }

  async getLeaderboard(circleId: string) {
    const members = await this.getCircleMembers(circleId);
    return members
      .sort((a, b) => b.total_points - a.total_points)
      .map((member, idx) => ({
        rank: idx + 1,
        member,
        points: member.total_points,
        streak_days: member.streak_days,
      }));
  }

  // ── Posts ────────────────────────────────────────────────

  private async getCirclePosts(
    circleId: string,
    requestingUserId: string,
    limit = 20,
    cursor?: string,
  ): Promise<CirclePostWithAuthor[]> {
    let query = this.supabase
      .from('circle_posts')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cursor) {
      query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const posts = (data ?? []) as any[];
    if (posts.length === 0) return [];

    const postIds = posts.map((p) => p.id);
    const { data: likes } = await this.supabase
      .from('circle_post_likes')
      .select('post_id')
      .eq('post_id', postIds)
      .eq('user_id', requestingUserId);

    const likedSet = new Set((likes ?? []).map((l: any) => l.post_id));

    const postUserIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: postProfiles } = await this.supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .in('id', postUserIds);
    const postProfileMap = new Map(postProfiles?.map((p) => [p.id, p]) || []);

    const enriched: CirclePostWithAuthor[] = await Promise.all(
      posts.map(async (post) => {
        const { data: comments } = await this.supabase
          .from('circle_comments')
          .select('*')
          .eq('post_id', post.id)
          .order('created_at', { ascending: true })
          .limit(3);

        const safeComments = comments || [];
        const commentUserIds = [...new Set(safeComments.map((c) => c.user_id))];
        const { data: commentProfiles } = await this.supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .in(
            'id',
            commentUserIds.length > 0
              ? commentUserIds
              : ['00000000-0000-0000-0000-000000000000'],
          );
        const commentProfileMap = new Map(
          commentProfiles?.map((p) => [p.id, p]) || [],
        );

        const enrichedComments = safeComments.map((c) => {
          const cp = commentProfileMap.get(c.user_id);
          return {
            ...c,
            author: cp 
              ? { ...cp, full_name: cp.full_name || cp.username } 
              : { id: c.user_id, full_name: 'Unknown', avatar_url: null, username: 'unknown' }
          };
        });

        const pp = postProfileMap.get(post.user_id);

        return {
          ...post,
          author: pp 
            ? { ...pp, full_name: pp.full_name || pp.username } // FIX: Fallback to username
            : { id: post.user_id, full_name: 'Unknown', avatar_url: null, username: 'unknown' },
          liked_by_me: likedSet.has(post.id),
          recent_comments: enrichedComments as CircleCommentWithAuthor[],
        } as CirclePostWithAuthor;
      }),
    );

    return enriched;
  }

  async getFeed(
    circleId: string,
    requestingUserId: string,
    limit = 20,
    cursor?: string,
  ) {
    const posts = await this.getCirclePosts(circleId, requestingUserId, limit, cursor);

    const { data: circle } = await this.supabase
      .from('execution_circles')
      .select('*')
      .eq('id', circleId)
      .single();

    return {
      posts,
      circle,
      cursor: posts.length === limit ? posts[posts.length - 1]?.created_at : null,
    };
  }

  async createPost(input: CreatePostInput, userId: string): Promise<CirclePost> {
    const { data, error } = await this.supabase
      .from('circle_posts')
      .insert({
        circle_id: input.circle_id,
        user_id: userId,
        content: input.content,
        post_type: input.post_type,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create post');

    await this.supabase
      .from('circle_members')
      .update({ last_active_at: new Date().toISOString() })
      .eq('circle_id', input.circle_id)
      .eq('user_id', userId);

    return data as CirclePost;
  }

  async createComment(input: CreateCommentInput, userId: string): Promise<CircleComment> {
    const { data, error } = await this.supabase
      .from('circle_comments')
      .insert({
        post_id: input.post_id,
        user_id: userId,
        content: input.content,
      })
      .select()
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create comment');

    // Log activity — get circle_id from the post
    const { data: post } = await this.supabase
      .from('circle_posts')
      .select('circle_id')
      .eq('id', input.post_id)
      .single();

    if (post?.circle_id) {
      await this.supabase.from('circle_activity').insert({
        circle_id: post.circle_id,
        user_id: userId,
        activity_type: 'post_created',
        metadata: { post_id: input.post_id, action: 'commented' },
      });
    }

    return data as CircleComment;
  }

  // FIXED: toggleLike now returns updated likes_count
  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<{ liked: boolean; likes_count: number }> {
    const { data: existing } = await this.supabase
      .from('circle_post_likes')
      .select('post_id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      await this.supabase
        .from('circle_post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
    } else {
      await this.supabase
        .from('circle_post_likes')
        .insert({ post_id: postId, user_id: userId });
    }

    // The DB trigger updates likes_count automatically.
    // Fetch the updated count to return to frontend for optimistic UI.
    const { data: updatedPost } = await this.supabase
      .from('circle_posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return {
      liked: !existing,
      likes_count: updatedPost?.likes_count ?? 0,
    };
  }

  // ── Weekly Challenge ─────────────────────────────────────

  private async getActiveChallenge(
    circleId: string,
    userId: string,
  ): Promise<CircleWeeklyChallengeWithProgress | null> {
    const today = new Date().toISOString().split('T')[0];

    const { data: challenge } = await this.supabase
      .from('circle_weekly_challenges')
      .select('*')
      .eq('circle_id', circleId)
      .lte('week_start', today)
      .gte('week_end', today)
      .maybeSingle();

    if (!challenge) return null;

    const { count: completedCount } = await this.supabase
      .from('circle_challenge_completions')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_id', challenge.id);

    const { data: myCompletion } = await this.supabase
      .from('circle_challenge_completions')
      .select('challenge_id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', userId)
      .maybeSingle();

    return {
      ...challenge,
      completed_count: completedCount ?? 0,
      completed_by_me: !!myCompletion,
    } as CircleWeeklyChallengeWithProgress;
  }

  async completeChallenge(challengeId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('circle_challenge_completions')
      .insert({ challenge_id: challengeId, user_id: userId });

    if (error) throw new Error(error.message);

    const { error: rpcError } = await this.supabase.rpc('increment_member_points', {
      p_challenge_id: challengeId,
      p_user_id: userId,
      p_points: 50,
    });

    if (rpcError) throw new Error(rpcError.message);

    const { data: member } = await this.supabase
      .from('circle_members')
      .select('id, accountability_score')
      .eq('user_id', userId)
      .maybeSingle();

    if (member) {
      await this.supabase
        .from('circle_members')
        .update({ accountability_score: (member.accountability_score || 0) + 5 })
        .eq('id', member.id);
    }
  }

  // ── Circle Activity (NEW) ────────────────────────────────

  async getCircleActivity(
    circleId: string,
    limit = 10,
  ): Promise<CircleActivityWithProfile[]> {
    const { data: activities, error } = await this.supabase
      .from('circle_activity')
      .select('*')
      .eq('circle_id', circleId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    if (!activities || activities.length === 0) return [];

    const userIds = [...new Set(activities.map((a) => a.user_id))];
    const { data: profiles } = await this.supabase
      .from('profiles')
      .select('id, full_name, avatar_url, username')
      .in('id', userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    return activities.map((a) => {
      const p = profileMap.get(a.user_id);
      return {
        ...a,
        profile: p 
          ? { ...p, full_name: p.full_name || p.username } // FIX: Fallback to username
          : { id: a.user_id, full_name: 'Someone', avatar_url: null, username: 'unknown' }
      };
    }) as CircleActivityWithProfile[];
  }

  // ── My circle ────────────────────────────────────────────

  async getUserCircle(userId: string): Promise<ExecutionCircle | null> {
    const { data } = await this.supabase
      .from('circle_members')
      .select('circle_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data?.circle_id) return null;

    const { data: circle } = await this.supabase
      .from('execution_circles')
      .select('*')
      .eq('id', data.circle_id)
      .single();

    return circle as ExecutionCircle | null;
  }

  // ── Upload Proof ─────────────────────────────────────────

  async uploadProof(
    userId: string,
    circleId: string,
    imageUrl: string,
    description: string,
  ) {
    const { data: proof, error: proofError } = await this.supabase
      .from('proof_uploads')
      .insert({
        user_id: userId,
        circle_id: circleId,
        file_url: imageUrl,
        description: description || '',
      })
      .select()
      .single();

    if (proofError) throw new Error(`Proof insert failed: ${proofError.message}`);

    const postContent = `📸 Uploaded proof: ${description || 'Activity completed!'}\n\n[IMAGE:${imageUrl}]`;
    await this.createPost(
      { circle_id: circleId, content: postContent, post_type: 'win' },
      userId,
    );

    const { data: member } = await this.supabase
      .from('circle_members')
      .select('id, accountability_score')
      .eq('user_id', userId)
      .eq('circle_id', circleId)
      .maybeSingle();

    if (member) {
      await this.supabase
        .from('circle_members')
        .update({
          accountability_score: (member.accountability_score || 0) + 3,
          last_active_at: new Date().toISOString(),
        })
        .eq('id', member.id);
    }

    await this.supabase.from('activity_logs').insert({
      user_id: userId,
      metadata_json: { type: 'proof_uploaded', proof_id: proof.id, circle_id: circleId },
    });

    // Also log to circle_activity
    await this.supabase.from('circle_activity').insert({
      circle_id: circleId,
      user_id: userId,
      activity_type: 'proof_uploaded',
      metadata: { proof_id: proof.id, description },
    });

    return proof;
  }

  // ── Request Circle Change ────────────────────────────────

  async requestCircleChange(
    userId: string,
    circleId: string,
    reason: string,
  ): Promise<{ success: boolean }> {
    const { error } = await this.supabase
      .from('circle_change_requests')
      .insert({ user_id: userId, current_circle_id: circleId, reason });

    if (error) throw new Error(error.message);
    return { success: true };
  }
}