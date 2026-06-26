import { supabase } from "../../data/supabase.client.js";

interface UpdateProfilePayload {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  targetRole?: string;
}

export class ProfileService {
  static async getProfileData(userId: string) {
    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      throw profileError;
    }

    // Fetch latest goal
    const { data: goal, error: goalError } = await supabase
      .from("user_goals")
      .select("id, title, current_level, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (goalError && goalError.code !== "PGRST116") {
      throw goalError;
    }

    let roadmapData = null;

    if (goal) {
      const { data: roadmap, error: roadmapError } = await supabase
        .from("roadmaps")
        .select("*")
        .eq("goal_id", goal.id)
        .single();

      if (roadmapError && roadmapError.code !== "PGRST116") {
        throw roadmapError;
      }

      if (roadmap) {
        const { data: phases } = await supabase
          .from("roadmap_phases")
          .select("estimated_days")
          .eq("roadmap_id", roadmap.id);

        const calculatedWeeks = phases
          ? Math.ceil(
              phases.reduce(
                (sum, phase) => sum + (phase.estimated_days || 0),
                0
              ) / 7
            )
          : 0;

        roadmapData = {
          id: roadmap.id,
          title: roadmap.title,
          totalWeeks: roadmap.total_weeks ?? calculatedWeeks,
          generatedBy:
            roadmap.generated_by ?? "AI Engine (OpenAI GPT-4)",
          goal: goal.title,
          createdAt: roadmap.created_at,
        };
      }
    }

    return {
      success: true,
      data: {
        profile: {
          username: profile?.username ?? "Developer",
          bio: profile?.bio ?? "",
          avatarUrl: profile?.avatar_url ?? "",
          currentLevel: profile?.current_level ?? "Beginner",
          targetRole: profile?.target_role ?? "",
        },
        roadmap: roadmapData,
      },
    };
  }

  static async updateProfile(
    userId: string,
    payload: UpdateProfilePayload
  ) {
    const updatePayload: Partial<{
      username: string;
      bio: string;
      avatar_url: string;
      target_role: string;
    }> = {};

    if (payload.username !== undefined) {
      updatePayload.username = payload.username;
    }

    if (payload.bio !== undefined) {
      updatePayload.bio = payload.bio;
    }

    if (payload.avatarUrl !== undefined) {
      updatePayload.avatar_url = payload.avatarUrl;
    }

    if (payload.targetRole !== undefined) {
      updatePayload.target_role = payload.targetRole;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: {
        profile: {
          username: data.username,
          bio: data.bio,
          avatarUrl: data.avatar_url,
          currentLevel: data.current_level,
          targetRole: data.target_role,
        },
      },
    };
  }
}