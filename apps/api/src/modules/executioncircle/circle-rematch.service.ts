// import { SupabaseClient } from "@supabase/supabase-js";

// export class CircleRematchService {
//   constructor(private supabase: SupabaseClient) {}

//   async rematchUsers() {
//     const { data: members } = await this.supabase
//       .from("circle_members")
//       .select("*");

//     if (!members) return;

//     for (const member of members) {
//       const score = member.accountability_score || 0;

//       let rank = "bronze";

//       if (score >= 90) rank = "diamond";
//       else if (score >= 75) rank = "gold";
//       else if (score >= 60) rank = "silver";

//       const { data: circle } = await this.supabase
//         .from("execution_circles")
//         .select("*")
//         .eq("circle_rank", rank)
//         .limit(1)
//         .single();

//       if (!circle) continue;

//       await this.supabase
//         .from("circle_members")
//         .update({
//           circle_id: circle.id,
//           last_rematched_at: new Date().toISOString(),
//         })
//         .eq("id", member.id);
//     }
//   }
// }











// import { SupabaseClient } from "@supabase/supabase-js";

// export class CircleRematchService {
//   constructor(private supabase: SupabaseClient) {}

//   async rematchUsers() {
//     // 1. Get all members with their circle data
//     const { data: members } = await this.supabase
//       .from("circle_members")
//       .select("*, execution_circles(goal, duration_months, current_level)");

//     if (!members) return;

//     // 2. Group by cohorts (Goal + Duration + Level)
//     const cohorts = new Map<string, any[]>();
    
//     for (const m of members) {
//       const c = m.execution_circles;
//       if (!c) continue;
//       const key = `${c.goal}-${c.duration_months}-${c.current_level}`;
//       if (!cohorts.has(key)) cohorts.set(key, []);
//       cohorts.get(key)!.push(m);
//     }

//     // 3. Process each cohort
//     for (const [key, cohortMembers] of cohorts.entries()) {
//       // Sort cohort by score descending to group high performers
//       cohortMembers.sort((a, b) => (b.accountability_score || 0) - (a.accountability_score || 0));

//       const chunkSize = 10; // Max members per circle
//       for (let i = 0; i < cohortMembers.length; i += chunkSize) {
//         const chunk = cohortMembers.slice(i, i + chunkSize);
        
//         // Use existing circle of the top performer in this chunk, or let them stay
//         const targetCircleId = chunk[0].circle_id;

//         // Assign ranks based on relative percentile in the total platform
//         for (const m of chunk) {
//           const score = m.accountability_score || 0;
//           let rank = "bronze";
//           if (score >= 90) rank = "diamond";
//           else if (score >= 75) rank = "gold";
//           else if (score >= 50) rank = "silver";

//           await this.supabase
//             .from("circle_members")
//             .update({
//               circle_id: targetCircleId,
//               circle_rank: rank,
//               weekly_completion: 0, // Reset for new week
//               last_rematched_at: new Date().toISOString(),
//             })
//             .eq("id", m.id);
//         }
//       }
//     }
//   }
// }
























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