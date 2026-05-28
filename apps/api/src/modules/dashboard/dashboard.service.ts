import { supabase } from "../../data/supabase.client.js";
import { dailyTaskService } from "../dailytask/dailytask.service.js";

type ActivityLog = {
  created_at: string;
};

export class DashboardService {
  async getDashboard(userId: string) {
    // =========================================================
    // ENSURE WEEKLY PLAN EXISTS
    // =========================================================
    await dailyTaskService.ensureWeeklyPlan(userId);

    const today = new Date();

    const todayStr = today.toISOString().split("T")[0];

    // =========================================================
    // PROFILE
    // =========================================================

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // =========================================================
    // GET USER GOAL
    // =========================================================

    const { data: goal } = await supabase
      .from("user_goals")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .single();

    if (!goal) {
      throw new Error("Goal not found");
    }

    // =========================================================
    // GET ROADMAP
    // =========================================================

    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("goal_id", goal.id)
      .single();

    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    // =========================================================
    // ROADMAP PHASES
    // =========================================================

    const { data: phases } = await supabase
      .from("roadmap_phases")
      .select("*")
      .eq("roadmap_id", roadmap?.id);

    // =========================================================
    // ALL ROADMAP TASKS
    // =========================================================

    const { data: allTasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("roadmap_id", roadmap?.id);

    // =========================================================
    // TODAY DAILY TASKS
    // =========================================================

    const { data: tasks } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("scheduled_for", todayStr)
      .order("created_at", {
        ascending: true,
      });

    // =========================================================
    // WEEKLY TASKS (7 days including today)
    // =========================================================

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const { data: weeklyTasks } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_for", todayStr)
      .lte("scheduled_for", weekEndStr)
      .order("scheduled_for", {
        ascending: true,
      });

    // =========================================================
    // ACTIVITY LOGS
    // =========================================================

    const { data: activityLogs } = await supabase
      .from("activity_logs")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      });

    // =========================================================
    // EXECUTION METRICS
    // =========================================================

    const { data: metrics } = await supabase
      .from("execution_metrics")
      .select("*")
      .eq("user_id", userId)
      .single();

    // =========================================================
    // AI PREDICTIONS
    // =========================================================

    const { data: predictions } = await supabase
      .from("ai_predictions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(3);

    // =========================================================
    // RECOVERY RECOMMENDATIONS
    // =========================================================

    const { data: recovery } = await supabase
      .from("recovery_recommendations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .single();

    // =========================================================
    // STREAK LOGIC
    // =========================================================

    function calculateStreak(activityLogs: ActivityLog[]) {
      if (!activityLogs.length) return 0;

      const uniqueDays = [
        ...new Set(
          activityLogs.map((log) =>
            new Date(log.created_at).toLocaleDateString("en-CA"),
          ),
        ),
      ].sort(
        (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
      );

      let streak = 0;

      const today = new Date();

      for (let i = 0; i < uniqueDays.length; i++) {
        const expectedDate = new Date(today);

        expectedDate.setHours(0, 0, 0, 0);

        expectedDate.setDate(today.getDate() - i);

        const expectedStr = expectedDate.toLocaleDateString("en-CA");

        if (uniqueDays[i] === expectedStr) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    }

    const currentStreak = calculateStreak(activityLogs || []);

    // =========================================================
    // TASK ANALYTICS
    // =========================================================

    const totalTasks = tasks?.length || 0;

    const completedTasks = tasks?.filter((task) => task.completed) || [];

    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0;

    // =========================================================
    // ROADMAP PROGRESS (Based on Tasks, not Phases)
    // =========================================================

    const totalRoadmapTasks = allTasks?.length || 0;

    const totalRoadmapMinutes =
      allTasks?.reduce((sum, task) => sum + (task.estimated_minutes || 0), 0) || 0;
    const completedRoadmapMinutes =
      allTasks?.reduce((sum, task) => {
        const estimated = task.estimated_minutes || 0;
        const progress = task.progress_minutes || 0;
        return sum + Math.min(progress, estimated);
      }, 0) || 0;

    const roadmapProgress =
      totalRoadmapMinutes > 0
        ? Math.round((completedRoadmapMinutes / totalRoadmapMinutes) * 100)
        : 0;

    // =========================================================
    // EXECUTION SCORE
    // =========================================================

    let executionGrade = "C";

    if (completionRate >= 90) {
      executionGrade = "A";
    } else if (completionRate >= 75) {
      executionGrade = "B";
    }

    // =========================================================
    // RETURN CLEAN DASHBOARD OBJECT
    // =========================================================

    return {
      profile: {
        username: profile?.username,

        level: profile?.current_level,

        targetRole: profile?.target_role,
      },

      roadmap: {
        title: roadmap?.title,

        progress: roadmapProgress,
      },

      streak: {
        current: currentStreak,
      },

      tasks: {
        today: tasks?.map((task) => ({
          id: task.id,

          title: task.title,

          estimatedMinutes: task.session_minutes,

          completed: task.completed,
        })),

        weekly:
          weeklyTasks?.map((task) => ({
            id: task.id,

            title: task.title,

            estimatedMinutes: task.session_minutes,

            completed: task.completed,

            scheduledFor: task.scheduled_for,
          })) || [],
      },

      analytics: {
        completionRate,

        executionGrade,

        totalTasks,

        completedTasks: completedTasks.length,
      },

      ai: {
        predictions,

        recovery,
      },

      metrics,
    };
  }
}

export const dashboardService = new DashboardService();
