import { supabase } from "../supabase.client.js";

export class GoalRepository {
  static async getLatestGoal(userId: string) {
    const { data, error } = await supabase
      .from("user_goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return data;
  }

  static async createGoal(data: any) {
    const { data: goal, error } =
      await supabase
        .from("user_goals")
        .insert(data)
        .select()
        .single();

    if (error) throw error;

    return goal;
  }
}