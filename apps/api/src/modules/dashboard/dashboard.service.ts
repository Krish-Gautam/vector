import { supabase } from "../../data/supabase.client.js";
import { dailyTaskService } from "../dailytask/dailytask.service.js";
import { zoneStatusService } from "../dailytask/zone-status.service.js";

export class DashboardService {
  async getDashboard(userId: string) {
    // =========================================================
    // ENSURE WEEKLY PLAN EXISTS
    // =========================================================
    await dailyTaskService.ensureWeeklyPlan(userId);
    function dateInTz(date: Date, tz: string) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: tz,
      }).format(date);
    }

    // =========================================================
    // PROFILE + GOAL (goal needed for roadmap lookup)
    // =========================================================
    const [profileResult, goalResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase
        .from("user_goals")
        .select("id, current_level, progress_percentage, zone_status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    const profile = profileResult.data;
    let goal = goalResult.data;

    if (!goal) throw new Error("No goal found");

    // Sync zone status
    const newZoneStatus = await zoneStatusService.syncZoneStatus(userId, {
      timezone: profile?.timezone ?? "Asia/Kolkata",
      currentGoal: {
        id: goal.id,
        zone_status: goal.zone_status,
      },
    });

    if (newZoneStatus !== goal.zone_status) {
      goal = { ...goal, zone_status: newZoneStatus };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tz = profile?.timezone ?? "Asia/Kolkata";
    const todayStr = dateInTz(today, tz);

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);
    const weekEndStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
    }).format(weekEnd);

    // Roadmap depends on goal.id so fetched after
    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("goal_id", goal.id)
      .single();

    if (!roadmap) throw new Error("No roadmap found");

    // =========================================================
    // ALL REMAINING QUERIES IN PARALLEL
    // Previously every query was sequential — this cuts dashboard
    // load time significantly by firing them all at once.
    // =========================================================
    const [
      phasesResult,
      allTasksResult,
      todayTasksResult,
      weeklyTasksResult,
      metricsResult,
      predictionsResult,
      recoveryResult,
      streakResult,
    ] = await Promise.all([
      // CHANGE: query phase_progress view instead of roadmap_phases
      // so completion_percentage is always live, never stale
      supabase
        .from("phase_progress")
        .select("*")
        .eq("roadmap_id", roadmap.id)
        .order("phase_order", { ascending: true }),

      // ALL ROADMAP TASKS
      // select only columns we actually use — avoids over-fetching
      supabase
        .from("tasks")
        .select(
          "id, title, estimated_minutes, progress_minutes, status, task_order, phase_id",
        )
        .eq("roadmap_id", roadmap.id)
        .order("task_order", { ascending: true }),

      // TODAY DAILY TASKS
      supabase
        .from("daily_tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("scheduled_for", todayStr)
        .order("created_at", { ascending: true }),

      // WEEKLY TASKS
      supabase
        .from("daily_tasks")
        .select("*")
        .eq("user_id", userId)
        .gte("scheduled_for", todayStr)
        .lte("scheduled_for", weekEndStr)
        .order("scheduled_for", { ascending: true }),

      // EXECUTION METRICS
      supabase
        .from("execution_metrics")
        .select("*")
        .eq("user_id", userId)
        .single(),

      // AI PREDICTIONS
      supabase
        .from("ai_predictions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),

      // RECOVERY RECOMMENDATIONS
      supabase
        .from("recovery_recommendations")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),

      // CHANGE: streak is computed via timezone-safe application logic
      // to avoid bugs with the RPC not returning active streak before doing today's tasks
      dailyTaskService.getStreak(userId, tz),
    ]);

    const phases = phasesResult.data ?? [];
    const allTasks = allTasksResult.data ?? [];
    const todayTasks = todayTasksResult.data ?? [];
    const weeklyTasks = weeklyTasksResult.data ?? [];
    const metrics = metricsResult.data;
    const predictions = predictionsResult.data ?? [];
    const recovery = recoveryResult.data;

    // =========================================================
    // STREAK
    // =========================================================
    const currentStreak = (streakResult as number) ?? 0;

    // =========================================================
    // ROADMAP PROGRESS (based on minutes, not task count)
    // =========================================================
    const totalRoadmapMinutes = allTasks.reduce(
      (sum, task) => sum + (task.estimated_minutes || 0),
      0,
    );

    const completedRoadmapMinutes = allTasks.reduce((sum, task) => {
      return (
        sum + Math.min(task.progress_minutes || 0, task.estimated_minutes || 0)
      );
    }, 0);

    const roadmapProgress =
      totalRoadmapMinutes > 0
        ? Math.round((completedRoadmapMinutes / totalRoadmapMinutes) * 100)
        : 0;

    // =========================================================
    // ROADMAP TASK STATUS COUNTS
    // CHANGE: uses status enum instead of completed boolean
    // (completed column was dropped from tasks)
    // =========================================================
    const totalRoadmapTasks = allTasks.length;
    const completedRoadmapTasks = allTasks.filter(
      (t) => t.status === "COMPLETED",
    ).length;
    const inProgressRoadmapTasks = allTasks.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;

    // =========================================================
    // TODAY TASK ANALYTICS
    // Scoped to today's daily_tasks — reflects the current session.
    // daily_tasks still has its own completed boolean (not dropped).
    // =========================================================
    const totalTodayTasks = todayTasks.length;
    const completedTodayCount = todayTasks.filter((t) => t.completed).length;

    const completionRate =
      totalTodayTasks > 0
        ? Math.round((completedTodayCount / totalTodayTasks) * 100)
        : 0;

    // =========================================================
    // EXECUTION GRADE (based on today's completion rate)
    // =========================================================
    let executionGrade = "C";
    if (completionRate >= 90) executionGrade = "A";
    else if (completionRate >= 75) executionGrade = "B";

    // =========================================================
    // CURRENT ACTIVE TASK
    // First IN_PROGRESS task, or first PENDING if none in progress.
    // Useful for "what to work on now" UI element.
    // =========================================================
    const activeTask =
      allTasks.find((t) => t.status === "IN_PROGRESS") ??
      allTasks.find((t) => t.status === "PENDING") ??
      null;

    // =========================================================
    // RETURN DASHBOARD
    // =========================================================
    return {
      profile: {
        username: profile?.username,
        level: goal?.current_level ?? "beginner",
        targetRole: profile?.target_role,
        zoneStatus: goal?.zone_status ?? "ON_TRACK",
      },

      roadmap: {
        title: roadmap.title,
        progress: roadmapProgress,
        totalTasks: totalRoadmapTasks,
        completedTasks: completedRoadmapTasks,
        inProgressTasks: inProgressRoadmapTasks,
      },

      // CHANGE: phases now include live completion_percentage,
      // total_tasks, completed_tasks, total_minutes, progress_minutes
      // from the phase_progress view — never stale
      phases,

      // Current active task with percent complete — new addition
      activeTask: activeTask
        ? {
            id: activeTask.id,
            title: activeTask.title,
            estimatedMinutes: activeTask.estimated_minutes,
            progressMinutes: activeTask.progress_minutes,
            percentComplete:
              activeTask.estimated_minutes > 0
                ? Math.round(
                    (activeTask.progress_minutes /
                      activeTask.estimated_minutes) *
                      100,
                  )
                : 0,
          }
        : null,

      streak: {
        current: currentStreak,
      },

      tasks: {
        today: todayTasks.map((task) => ({
          id: task.id,
          title: task.title,
          estimatedMinutes: task.session_minutes,
          completed: task.completed,
          completedAt: task.completed_at,
        })),

        weekly: weeklyTasks.map((task) => ({
          id: task.id,
          title: task.title,
          estimatedMinutes: task.session_minutes,
          completed: task.completed,
          scheduledFor: task.scheduled_for,
        })),
      },

      analytics: {
        completionRate,
        executionGrade,
        totalTodayTasks,
        completedTodayTasks: completedTodayCount,
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
