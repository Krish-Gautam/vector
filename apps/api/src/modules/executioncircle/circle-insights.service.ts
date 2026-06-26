
import { SupabaseClient } from '@supabase/supabase-js';
import { CircleInsights } from '../../shared/types/executioncircle.types.js';

export class CircleInsightsService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Derives insights from existing tables only:
   *   circle_members  → avg accountability_score, avg streak_days
   *   daily_tasks     → avg completion rate across all circle members
   * No new tables created.
   */
  async getCircleInsights(circleId: string): Promise<CircleInsights> {
    // 1. Fetch this circle's members
    const { data: members, error: membersError } = await this.supabase
      .from('circle_members')
      .select('user_id, streak_days, accountability_score')
      .eq('circle_id', circleId);

    if (membersError) throw new Error(membersError.message);
    if (!members || members.length === 0) {
      return { avg_score: 0, better_than: 0, avg_streak: 0, avg_completion: 0 };
    }

    const memberCount = members.length;
    const userIds = members.map((m) => m.user_id);

    // 2. Compute avg accountability score and avg streak for this circle
    const avgScore = Math.round(
      members.reduce((sum, m) => sum + (m.accountability_score ?? 0), 0) / memberCount,
    );
    const avgStreak = Math.round(
      members.reduce((sum, m) => sum + (m.streak_days ?? 0), 0) / memberCount,
    );

    // 3. Avg task completion rate from daily_tasks (source of truth)
    const { data: tasks, error: tasksError } = await this.supabase
      .from('daily_tasks')
      .select('user_id, completed')
      .in('user_id', userIds);

    if (tasksError) throw new Error(tasksError.message);

    let avgCompletion = 0;
    if (tasks && tasks.length > 0) {
      const completedCount = tasks.filter((t) => t.completed === true).length;
      avgCompletion = Math.round((completedCount / tasks.length) * 100);
    }

    // 4. "better_than" — % of other circles this circle outperforms on avg score
    const { data: allMemberScores, error: allError } = await this.supabase
      .from('circle_members')
      .select('circle_id, accountability_score');

    let betterThan = 0;
    if (!allError && allMemberScores && allMemberScores.length > 0) {
      const circleScoreMap = new Map<string, number[]>();
      for (const row of allMemberScores) {
        if (!circleScoreMap.has(row.circle_id)) {
          circleScoreMap.set(row.circle_id, []);
        }
        circleScoreMap.get(row.circle_id)!.push(row.accountability_score ?? 0);
      }

      const circleAvgs = Array.from(circleScoreMap.entries()).map(([id, scores]) => ({
        id,
        avg: scores.reduce((s, v) => s + v, 0) / scores.length,
      }));

      const totalCircles = circleAvgs.length;
      if (totalCircles > 1) {
        const lowerCount = circleAvgs.filter(
          (c) => c.id !== circleId && c.avg < avgScore,
        ).length;
        betterThan = Math.round((lowerCount / (totalCircles - 1)) * 100);
      }
    }

    return {
      avg_score: avgScore,
      better_than: betterThan,
      avg_streak: avgStreak,
      avg_completion: avgCompletion,
    };
  }
}