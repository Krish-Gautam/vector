
import { SupabaseClient } from '@supabase/supabase-js';

export class CircleRematchService {
  constructor(private supabase: SupabaseClient) {}

  async rematchUsers() {
    // 1. Fetch all members with their circle metadata
    const { data: members, error } = await this.supabase
      .from('circle_members')
      .select('*, execution_circles(goal, duration_months, current_level)');

    if (error) {
      console.error('CircleRematchService: failed to fetch members', error.message);
      return;
    }
    if (!members || members.length === 0) return;

    // 2. Group into cohorts by goal + duration + level
    const cohorts = new Map<string, any[]>();

    for (const m of members) {
      const c = m.execution_circles;
      if (!c) continue;
      const key = `${c.goal}-${c.duration_months}-${c.current_level}`;
      if (!cohorts.has(key)) cohorts.set(key, []);
      cohorts.get(key)!.push(m);
    }

    // 3. Process each cohort independently
    for (const [, cohortMembers] of cohorts.entries()) {
      // Sort descending by accountability score so high performers cluster together
      cohortMembers.sort(
        (a, b) => (b.accountability_score || 0) - (a.accountability_score || 0),
      );

      const chunkSize = 10;
      for (let i = 0; i < cohortMembers.length; i += chunkSize) {
        const chunk = cohortMembers.slice(i, i + chunkSize);

        // Top performer in this chunk anchors the circle
        const targetCircleId = chunk[0].circle_id;

        for (const m of chunk) {
          const score: number = m.accountability_score || 0;
          let rank = 'bronze';
          if (score >= 90) rank = 'diamond';
          else if (score >= 75) rank = 'gold';
          else if (score >= 50) rank = 'silver';

          const { error: updateError } = await this.supabase
            .from('circle_members')
            .update({
              circle_id: targetCircleId,
              circle_rank: rank,
              weekly_completion: 0,
              last_rematched_at: new Date().toISOString(),
            })
            .eq('id', m.id);

          if (updateError) {
            console.error(
              `CircleRematchService: failed to update member ${m.id}`,
              updateError.message,
            );
          }
        }
      }
    }
  }
}