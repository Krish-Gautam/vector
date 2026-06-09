import { SupabaseClient } from "@supabase/supabase-js";

export class CircleRankingService {
  constructor(private supabase: SupabaseClient) {}

  async updateCircleRank(circleId: string) {
    const { data: members } = await this.supabase
      .from("circle_members")
      .select("*")
      .eq("circle_id", circleId);

    if (!members?.length) return;

    const avg =
      members.reduce(
        (sum, m) => sum + (m.accountability_score || 0),
        0
      ) / members.length;

    let rank = "bronze";

    if (avg >= 90) rank = "diamond";
    else if (avg >= 75) rank = "gold";
    else if (avg >= 60) rank = "silver";

    await this.supabase
      .from("execution_circles")
      .update({
        circle_rank: rank,
        health_score: Math.round(avg),
      })
      .eq("id", circleId);
  }
}