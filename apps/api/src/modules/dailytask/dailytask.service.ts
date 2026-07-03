import { supabase } from "../../data/supabase.client.js";
import { zoneStatusService } from "./zone-status.service.js";

export class DailyTaskService {
  // =========================================================
  // PRIVATE HELPER: Get roadmap id for user
  // =========================================================
  private getLocalDateString(date: Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
    }).format(date);
  }
  private async getRoadmapId(userId: string): Promise<string> {
    const { data: goal } = await supabase
      .from("user_goals")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!goal) throw new Error("No goal found");

    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("goal_id", goal.id)
      .single();

    if (!roadmap) throw new Error("Roadmap not found");

    return roadmap.id;
  }

  // =========================================================
  // PRIVATE HELPER: Get all incomplete tasks ordered correctly
  // CHANGE: was .eq("completed", false) — column was dropped.
  //         Now filters by status != 'COMPLETED' and sorts by
  //         phase_order first, then task_order, so phases are
  //         respected in the planner.
  // =========================================================

  private async getIncompleteTasks(roadmapId: string) {
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        `
      id,
      title,
      estimated_minutes,
      progress_minutes,
      status,
      task_order,
      phase_id,
      roadmap_phases!inner ( phase_order )
    `,
      )
      .eq("roadmap_id", roadmapId)
      .neq("status", "COMPLETED");

    if (error) throw error;

    const result = tasks ?? [];

    // Sort client-side: phase_order first, then task_order.
    // Embedded-table ordering via .order(referencedTable/foreignTable)
    // has been unreliable across supabase-js/PostgREST versions,
    // so we sort explicitly here instead of trusting the DB-side order.
    result.sort((a: any, b: any) => {
      const phaseA = a.roadmap_phases?.phase_order ?? 0;
      const phaseB = b.roadmap_phases?.phase_order ?? 0;
      if (phaseA !== phaseB) return phaseA - phaseB;
      return (a.task_order ?? 0) - (b.task_order ?? 0);
    });

    return result;
  }

  // =========================================================
  // PRIVATE HELPER: Get daily study minutes for user
  // =========================================================

  private async getDailyMinutes(userId: string): Promise<number> {
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_study_minutes")
      .eq("id", userId)
      .single();

    return profile?.daily_study_minutes || 120;
  }

  // =========================================================
  // GENERATE WEEKLY TASKS
  // =========================================================

  async generateWeeklyTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this._buildWeeklyPlan(userId, today, 0, 7);
  }

  // =========================================================
  // PRIVATE: Core weekly planner
  // dayOffset    = which day to start from (0 = today, 7 = next week)
  // numberOfDays = how many days to plan
  // =========================================================

  private async _buildWeeklyPlan(
    userId: string,
    baseDate: Date,
    dayOffset: number,
    numberOfDays: number,
  ) {
    // CHANGE: run profile + roadmap lookups in parallel
    const [dailyMinutes, roadmapId] = await Promise.all([
      this.getDailyMinutes(userId),
      this.getRoadmapId(userId),
    ]);

    const tasks = await this.getIncompleteTasks(roadmapId);

    if (tasks.length === 0) return [];

    // Build list of dates to fill
    const datesToFill: string[] = [];
    for (let i = dayOffset; i < dayOffset + numberOfDays; i++) {
      const targetDate = new Date(baseDate);
      targetDate.setDate(baseDate.getDate() + i);
      datesToFill.push(this.getLocalDateString(targetDate));
    }

    // Check which dates already have daily_tasks in one query
    const { data: existingTasks } = await supabase
      .from("daily_tasks")
      .select("scheduled_for")
      .eq("user_id", userId)
      .in("scheduled_for", datesToFill);

    const existingDates = new Set(
      existingTasks?.map((t) => t.scheduled_for) || [],
    );

    const emptyDates = datesToFill.filter((d) => !existingDates.has(d));

    if (emptyDates.length === 0) return [];

    // =========================================================
    // Stateful planner: walk tasks in order, filling days.
    // A task may span multiple days; a day may contain multiple
    // tasks if one finishes before the day's minutes are used up.
    // =========================================================

    // Account for existing scheduled daily tasks to prevent over-scheduling
    const taskIds = tasks.map((t: any) => t.id);
    const { data: existingDailyTasks } = await supabase
      .from("daily_tasks")
      .select("roadmap_task_id, session_minutes")
      .eq("user_id", userId)
      .in("roadmap_task_id", taskIds);

    const scheduledMinutesMap = new Map<string, number>();
    (existingDailyTasks || []).forEach((dt: any) => {
      const current = scheduledMinutesMap.get(dt.roadmap_task_id) || 0;
      scheduledMinutesMap.set(
        dt.roadmap_task_id,
        current + (dt.session_minutes || 0),
      );
    });

    const getRemainingToSchedule = (task: any) => {
      const scheduled = scheduledMinutesMap.get(task.id) || 0;
      const accounted = Math.max(task.progress_minutes || 0, scheduled);
      return Math.max(0, task.estimated_minutes - accounted);
    };

    let taskIndex = 0;
    let minutesLeftInCurrentTask = getRemainingToSchedule(tasks[0]);

    const inserted: any[] = [];

    for (const dateStr of emptyDates) {
      let minutesLeftForDay = dailyMinutes;

      while (minutesLeftForDay > 0 && taskIndex < tasks.length) {
        // Skip tasks that have no remaining unscheduled minutes
        if (minutesLeftInCurrentTask <= 0) {
          taskIndex++;
          if (taskIndex >= tasks.length) break;
          minutesLeftInCurrentTask = getRemainingToSchedule(tasks[taskIndex]);
          continue;
        }

        const sessionMinutes = Math.min(
          minutesLeftForDay,
          minutesLeftInCurrentTask,
        );

        const { data: dailyTask, error } = await supabase
          .from("daily_tasks")
          .insert({
            user_id: userId,
            roadmap_task_id: tasks[taskIndex].id,
            title: tasks[taskIndex].title,
            scheduled_for: dateStr,
            session_minutes: sessionMinutes,
          })
          .select()
          .single();

        if (error) throw error;
        if (dailyTask) inserted.push(dailyTask);

        minutesLeftForDay -= sessionMinutes;
        minutesLeftInCurrentTask -= sessionMinutes;

        // Track newly scheduled minutes in map
        const currentScheduled =
          scheduledMinutesMap.get(tasks[taskIndex].id) || 0;
        scheduledMinutesMap.set(
          tasks[taskIndex].id,
          currentScheduled + sessionMinutes,
        );

        if (minutesLeftInCurrentTask <= 0) {
          taskIndex++;
          if (taskIndex < tasks.length) {
            minutesLeftInCurrentTask = getRemainingToSchedule(tasks[taskIndex]);
          }
        }
      }

      if (taskIndex >= tasks.length) break;
    }

    return inserted;
  }

  // =========================================================
  // GENERATE DAILY TASKS (single day)
  // Delegates to _buildWeeklyPlan for one day so logic is consistent.
  // =========================================================

  async generateDailyTasks(userId: string, targetDateStr?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = targetDateStr || this.getLocalDateString(today);

    const { data: existingTasks } = await supabase
      .from("daily_tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("scheduled_for", todayStr);

    if (existingTasks && existingTasks.length > 0) {
      return existingTasks;
    }

    const [year, month, day] = todayStr.split("-").map(Number);

    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);
    const dayOffset = Math.round(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );

    const results = await this._buildWeeklyPlan(userId, today, dayOffset, 1);
    return results.length > 0 ? results : null;
  }

  // =========================================================
  // ENSURE WEEKLY PLAN EXISTS
  // =========================================================

  async ensureWeeklyPlan(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this._buildWeeklyPlan(userId, today, 0, 7);
  }

  // =========================================================
  // GENERATE NEXT WEEK (GUARDED)
  // =========================================================

  async generateNextWeeklyPlan(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);

    const todayStr = this.getLocalDateString(today);
    const weekEndStr = this.getLocalDateString(weekEnd);

    const { data: completedThisWeek } = await supabase
      .from("daily_tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("completed", true)
      .gte("scheduled_for", todayStr)
      .lte("scheduled_for", weekEndStr);

    if ((completedThisWeek?.length || 0) < 3) {
      throw new Error(
        "Complete at least 3 tasks this week before generating next week.",
      );
    }

    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 13);

    const nextWeekStartStr = this.getLocalDateString(nextWeekStart);
    const nextWeekEndStr = this.getLocalDateString(nextWeekEnd);

    const { data: existingNextWeek } = await supabase
      .from("daily_tasks")
      .select("scheduled_for")
      .eq("user_id", userId)
      .gte("scheduled_for", nextWeekStartStr)
      .lte("scheduled_for", nextWeekEndStr);

    if ((existingNextWeek?.length || 0) > 0) {
      return {
        generated: [],
        skipped: true,
        reason: "Next week already has tasks scheduled.",
      };
    }

    const generated = await this._buildWeeklyPlan(userId, today, 7, 7);

    return { generated, skipped: false };
  }

  // =========================================================
  // COMPLETE DAILY TASK
  // =========================================================

  async completeDailyTask(dailyTaskId: string, userId: string) {
    const { data: dailyTask } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("id", dailyTaskId)
      .eq("user_id", userId)
      .single();

    if (!dailyTask) throw new Error("Daily task not found");
    if (dailyTask.completed) return { success: true };

    // =========================================================
    // MARK DAILY TASK COMPLETE
    // =========================================================

    const { error: updateError } = await supabase
      .from("daily_tasks")
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", dailyTaskId);

    if (updateError) throw updateError;

    // =========================================================
    // UPDATE ROADMAP TASK PROGRESS
    // CHANGE: removed completed, completed_at, and status from
    //         the update payload — the sync_task_completion trigger
    //         now handles all three automatically when
    //         progress_minutes is updated. Only send progress_minutes.
    // =========================================================

    const { data: roadmapTask } = await supabase
      .from("tasks")
      .select("id, progress_minutes, estimated_minutes, roadmap_id")
      .eq("id", dailyTask.roadmap_task_id)
      .single();

    if (!roadmapTask) throw new Error("Roadmap task not found");

    const calculatedProgress =
      (roadmapTask.progress_minutes || 0) + dailyTask.session_minutes;
    const newProgress = Math.min(
      calculatedProgress,
      roadmapTask.estimated_minutes || 0,
    );

    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update({ progress_minutes: newProgress })
      .eq("id", roadmapTask.id);

    if (taskUpdateError) throw taskUpdateError;

    // If task has reached estimated minutes, clean up any redundant future uncompleted daily tasks for this task
    if (newProgress >= (roadmapTask.estimated_minutes || 0)) {
      const todayStr = this.getLocalDateString(new Date());
      await supabase
        .from("daily_tasks")
        .delete()
        .eq("user_id", userId)
        .eq("roadmap_task_id", roadmapTask.id)
        .eq("completed", false)
        .gte("scheduled_for", todayStr);
    }

    // =========================================================
    // SYNC USER GOAL PROGRESS AND LEVEL
    // =========================================================
    try {
      const { data: roadmap } = await supabase
        .from("roadmaps")
        .select("goal_id")
        .eq("id", roadmapTask.roadmap_id)
        .single();

      if (roadmap?.goal_id) {
        await this.syncGoalProgress(roadmap.goal_id);
      }
    } catch (err) {
      console.error("Error syncing goal progress:", err);
    }

    // =========================================================
    // ACCOUNTABILITY ENGINE + ACTIVITY LOG in parallel
    // CHANGE: these two are independent — run together
    // =========================================================

    await Promise.all([
      this._updateCircleScore(userId),
      this._upsertActivityLog(userId, dailyTaskId),
    ]);

    // =========================================================
    // ENSURE WEEKLY PLAN IS MAINTAINED
    // =========================================================

    await this.ensureWeeklyPlan(userId);

    // =========================================================
    // SYNC ZONE STATUS
    // =========================================================
    try {
      await zoneStatusService.syncZoneStatus(userId);
    } catch (err) {
      console.error("Error syncing zone status in task completion:", err);
    }

    return { success: true };
  }

  // =========================================================
  // PRIVATE HELPER: Update circle member score
  // Extracted from completeDailyTask to keep it readable
  // =========================================================

  private async _updateCircleScore(userId: string) {
    const { data: membership } = await supabase
      .from("circle_members")
      .select("id, accountability_score, total_points, weekly_completion")
      .eq("user_id", userId)
      .maybeSingle();

    if (!membership) return;

    await supabase
      .from("circle_members")
      .update({
        accountability_score: (membership.accountability_score || 0) + 2,
        total_points: (membership.total_points || 0) + 2,
        weekly_completion: (membership.weekly_completion || 0) + 1,
        last_active_at: new Date().toISOString(),
      })
      .eq("id", membership.id);
  }

  // =========================================================
  // PRIVATE HELPER: Upsert activity log (one per day max)
  // CHANGE: was a check-then-insert with a date range scan.
  //         Now uses INSERT ... ON CONFLICT DO NOTHING against
  //         the unique index (user_id, activity_date) added in
  //         migrations — one round trip instead of two, and the
  //         DB enforces uniqueness so no race condition.
  // =========================================================

  private async _upsertActivityLog(userId: string, dailyTaskId: string) {
    const now = new Date();

    await supabase.from("activity_logs").insert({
      user_id: userId,
      created_at: now.toISOString(),
      metadata_json: { type: "task_completed", daily_task_id: dailyTaskId },
    });
    // The unique index on (user_id, activity_date) silently ignores
    // duplicate inserts for the same day — no explicit conflict
    // handling needed unless you want to inspect the error.
  }

  // =========================================================
  // GET WEEKLY TASKS
  // =========================================================

  async getWeeklyTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);

    const { data: tasks } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .gte("scheduled_for", this.getLocalDateString(today))
      .lte("scheduled_for", this.getLocalDateString(weekEnd))
      .order("scheduled_for", { ascending: true });

    return tasks || [];
  }

  // =========================================================
  // GET STREAK
  // CHANGE: new method — delegates to Postgres function so streak
  //         is timezone-safe and computed in one DB call
  // =========================================================

  async getStreak(userId: string): Promise<number> {
    const { data, error } = await supabase.rpc("get_user_streak", {
      p_user_id: userId,
    });

    if (error) throw error;
    return (data as number) ?? 0;
  }

  // =========================================================
  // SYNC USER GOAL PROGRESS AND LEVEL
  // =========================================================

  async syncGoalProgress(goalId: string) {
    // 1. Get roadmap
    const { data: roadmap, error: roadmapError } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("goal_id", goalId)
      .single();

    if (roadmapError || !roadmap) return;

    // 2. Get all tasks for this roadmap
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("estimated_minutes, progress_minutes")
      .eq("roadmap_id", roadmap.id);

    if (tasksError || !tasks) return;

    // 3. Calculate progress
    const totalMinutes = tasks.reduce(
      (sum, t) => sum + (t.estimated_minutes || 0),
      0,
    );
    const completedMinutes = tasks.reduce((sum, t) => {
      return sum + Math.min(t.progress_minutes || 0, t.estimated_minutes || 0);
    }, 0);
    const progressPercentage =
      totalMinutes > 0
        ? Math.round((completedMinutes / totalMinutes) * 100)
        : 0;

    // 4. Get current goal level
    const { data: goal, error: goalError } = await supabase
      .from("user_goals")
      .select("current_level")
      .eq("id", goalId)
      .single();

    if (goalError || !goal) return;

    // 5. Determine level transition
    const currentLevel = (goal.current_level || "beginner").toLowerCase();
    let newLevel = currentLevel;

    if (currentLevel === "beginner") {
      if (progressPercentage >= 75) {
        newLevel = "advanced";
      } else if (progressPercentage >= 35) {
        newLevel = "intermediate";
      }
    } else if (currentLevel === "intermediate") {
      if (progressPercentage >= 75) {
        newLevel = "advanced";
      }
    }

    // 6. Update user_goals
    await supabase
      .from("user_goals")
      .update({
        progress_percentage: progressPercentage,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", goalId);
  }

  // =========================================================
  // GET DAILY TASK HISTORY (All tasks up to today)
  // =========================================================

  async getDailyTaskHistory(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", userId)
      .single();

    const tz = profile?.timezone ?? "Asia/Kolkata";

    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
      new Date(),
    );

    const { data: tasks, error } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("user_id", userId)
      .lte("scheduled_for", todayStr)
      .order("scheduled_for", { ascending: false });

    if (error) throw error;

    return (tasks || []).map((task) => ({
      id: task.id,
      title: task.title,
      estimatedMinutes: task.session_minutes,
      completed: task.completed,
      scheduledFor: task.scheduled_for,
    }));
  }
}

export const dailyTaskService = new DailyTaskService();
