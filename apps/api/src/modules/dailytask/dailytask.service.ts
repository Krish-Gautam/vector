// // services/dailyTask.service.ts

// import { supabase } from "../../data/supabase.client.js";

// export class DailyTaskService {
//   // =========================================================
//   // GENERATE WEEKLY TASKS
//   // =========================================================

//   async generateWeeklyTasks(userId: string) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Generate tasks for the next 7 days starting from today
//     const tasksGenerated = [];

//     for (let i = 0; i < 7; i++) {
//       const targetDate = new Date(today);
//       targetDate.setDate(today.getDate() + i);
//       const dateStr = targetDate.toISOString().split("T")[0];

//       const task = await this.generateDailyTasks(userId, dateStr);
//       if (task) {
//         tasksGenerated.push(task);
//       }
//     }

//     return tasksGenerated;
//   }

//   // =========================================================
//   // GENERATE DAILY TASKS
//   // =========================================================

//   async generateDailyTasks(userId: string, targetDateStr?: string) {
//     const today = new Date();
//     const todayStr = targetDateStr || today.toISOString().split("T")[0];

//     // =========================================================
//     // CHECK IF TASKS ALREADY EXIST FOR THIS DATE
//     // =========================================================

//     const { data: existingTasks } = await supabase
//       .from("daily_tasks")
//       .select("id")
//       .eq("user_id", userId)
//       .eq("scheduled_for", todayStr);

//     if (existingTasks && existingTasks.length > 0) {
//       return existingTasks;
//     }

//     // =========================================================
//     // GET USER PROFILE
//     // =========================================================

//     const { data: profile } = await supabase
//       .from("profiles")
//       .select("daily_study_minutes")
//       .eq("id", userId)
//       .single();

//     const dailyMinutes = profile?.daily_study_minutes || 120;

//     // =========================================================
//     // GET USER GOAL
//     // =========================================================

//     const { data: goal } = await supabase
//       .from("user_goals")
//       .select("id")
//       .eq("user_id", userId)
//       .order("created_at", {
//         ascending: false,
//       })
//       .limit(1)
//       .single();

//     if (!goal) {
//       throw new Error("Goal not found");
//     }

//     // =========================================================
//     // GET ROADMAP
//     // =========================================================

//     const { data: roadmap } = await supabase
//       .from("roadmaps")
//       .select("id")
//       .eq("goal_id", goal.id)
//       .single();

//     if (!roadmap) {
//       throw new Error("Roadmap not found");
//     }

//     // =========================================================
//     // GET CURRENT ACTIVE TASK
//     // =========================================================

//     const { data: currentTask } = await supabase
//       .from("tasks")
//       .select("*")
//       .eq("roadmap_id", roadmap.id)
//       .eq("completed", false)
//       .order("task_order", {
//         ascending: true,
//       })
//       .limit(1)
//       .single();

//     if (!currentTask) {
//       return null;
//     }

//     // =========================================================
//     // CALCULATE REMAINING MINUTES
//     // =========================================================

//     const remainingMinutes =
//       currentTask.estimated_minutes - (currentTask.progress_minutes || 0);

//     if (remainingMinutes <= 0) {
//       return null;
//     }

//     // =========================================================
//     // GENERATE SESSION
//     // =========================================================

//     const sessionMinutes = Math.min(dailyMinutes, remainingMinutes);

//     const { data: dailyTask, error } = await supabase
//       .from("daily_tasks")
//       .insert({
//         user_id: userId,

//         roadmap_task_id: currentTask.id,

//         title: currentTask.title,

//         scheduled_for: todayStr,

//         session_minutes: sessionMinutes,
//       })
//       .select()
//       .single();

//     if (error) {
//       throw error;
//     }

//     return dailyTask;
//   }

//   // =========================================================
//   // ENSURE WEEKLY PLAN EXISTS
//   // =========================================================

//   async ensureWeeklyPlan(userId: string) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Check how many future tasks exist (including today)
//     const { data: futureTasks } = await supabase
//       .from("daily_tasks")
//       .select("scheduled_for")
//       .eq("user_id", userId)
//       .gte("scheduled_for", today.toISOString().split("T")[0])
//       .order("scheduled_for", { ascending: true });

//     const existingDates = new Set(
//       futureTasks?.map((task) => task.scheduled_for) || []
//     );

//     // Generate tasks for missing days up to 7 days ahead
//     const tasksGenerated = [];
//     for (let i = 0; i < 7; i++) {
//       const targetDate = new Date(today);
//       targetDate.setDate(today.getDate() + i);
//       const dateStr = targetDate.toISOString().split("T")[0];

//       if (!existingDates.has(dateStr)) {
//         const task = await this.generateDailyTasks(userId, dateStr);
//         if (task) {
//           tasksGenerated.push(task);
//         }
//       }
//     }

//     return tasksGenerated;
//   }

//   // =========================================================
//   // GENERATE NEXT WEEK (GUARDED)
//   // =========================================================

//   async generateNextWeeklyPlan(userId: string) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const weekEnd = new Date(today);
//     weekEnd.setDate(today.getDate() + 6);

//     const { data: remainingTasks } = await supabase
//       .from("daily_tasks")
//       .select("id")
//       .eq("user_id", userId)
//       .gte("scheduled_for", today.toISOString().split("T")[0])
//       .lte("scheduled_for", weekEnd.toISOString().split("T")[0])
//       .eq("completed", false);

//     if ((remainingTasks?.length || 0) > 4) {
//       throw new Error("Complete more tasks before generating next week.");
//     }

//     const nextWeekStart = new Date(today);
//     nextWeekStart.setDate(today.getDate() + 7);
//     const nextWeekEnd = new Date(today);
//     nextWeekEnd.setDate(today.getDate() + 13);

//     const nextWeekStartStr = nextWeekStart.toISOString().split("T")[0];
//     const nextWeekEndStr = nextWeekEnd.toISOString().split("T")[0];

//     const { data: existingNextWeek } = await supabase
//       .from("daily_tasks")
//       .select("scheduled_for")
//       .eq("user_id", userId)
//       .gte("scheduled_for", nextWeekStartStr)
//       .lte("scheduled_for", nextWeekEndStr)
//       .order("scheduled_for", { ascending: true });

//     if ((existingNextWeek?.length || 0) > 0) {
//       return {
//         generated: [],
//         skipped: true,
//         reason: "First complete pending tasks.",
//       };
//     }

//     const tasksGenerated = [];
//     for (let i = 7; i < 14; i++) {
//       const targetDate = new Date(today);
//       targetDate.setDate(today.getDate() + i);
//       const dateStr = targetDate.toISOString().split("T")[0];

//       const task = await this.generateDailyTasks(userId, dateStr);
//       if (task) {
//         tasksGenerated.push(task);
//       }
//     }

//     return {
//       generated: tasksGenerated,
//       skipped: false,
//     };
//   }

//   // =========================================================
//   // COMPLETE DAILY TASK
//   // =========================================================

//   async completeDailyTask(dailyTaskId: string, userId: string) {
//     // =========================================================
//     // GET DAILY TASK
//     // =========================================================

//     const { data: dailyTask } = await supabase
//       .from("daily_tasks")
//       .select("*")
//       .eq("id", dailyTaskId)
//       .eq("user_id", userId)
//       .single();

//     if (!dailyTask) {
//       throw new Error("Daily task not found");
//     }

//     if (dailyTask.completed) {
//       return dailyTask;
//     }

//     // =========================================================
//     // MARK DAILY TASK COMPLETE
//     // =========================================================
//     const { data, error } = await supabase
//       .from("daily_tasks")
//       .update({
//         completed: true,
//         completed_at: new Date(),
//       })
//       .eq("id", dailyTaskId)
//       .select();

//     console.log(data);
//     console.log(error);

//     // =========================================================
//     // UPDATE ROADMAP TASK PROGRESS
//     // =========================================================

//     const { data: roadmapTask } = await supabase
//       .from("tasks")
//       .select("*")
//       .eq("id", dailyTask.roadmap_task_id)
//       .single();

//     const newProgress =
//       (roadmapTask?.progress_minutes || 0) + dailyTask.session_minutes;

//     const isCompleted = newProgress >= roadmapTask.estimated_minutes;

//     const { data: updatedRoadmapTask, error: roadmapUpdateError } = await supabase
//       .from("tasks")
//       .update({
//         progress_minutes: newProgress,

//         completed: isCompleted,
//         completed_at: isCompleted ? new Date() : null,
//       })
//       .eq("id", roadmapTask.id);


//     // =========================================================
//     // INSERT ACTIVITY LOG
//     // =========================================================

//     const now = new Date();
//     const todayStr = now.toISOString().split("T")[0];
//     const todayStart = `${todayStr}T00:00:00.000Z`;
//     const todayEnd = `${todayStr}T23:59:59.999Z`;

//     const { data: existingActivity, error: activityCheckError } = await supabase
//       .from("activity_logs")
//       .select("id")
//       .eq("user_id", userId)
//       .gte("created_at", todayStart)
//       .lte("created_at", todayEnd)
//       .maybeSingle();

//     console.log("Checking for existing activity log:", {
//       userId,
//       todayStart,
//       todayEnd,
//       existingActivity,
//       activityCheckError,
//     });


//     if (!existingActivity) {
//       const { data: newActivity, error: insertError } = await supabase
//         .from("activity_logs")
//         .insert({
//           user_id: userId,
//           created_at: now.toISOString(),
//         })
//         .select()
//         .single();

//       console.log("Inserted new activity log:", {
//         newActivity,
//         insertError,
//       });
//     }

//     // =========================================================
//     // ENSURE WEEKLY PLAN IS MAINTAINED
//     // =========================================================

//     if (isCompleted) {
//       // Generate new tasks to maintain 7-day plan
//       await this.ensureWeeklyPlan(userId);
//     }

//     return {
//       success: true,
//     };
//   }

//   // =========================================================
//   // GET WEEKLY TASKS
//   // =========================================================

//   async getWeeklyTasks(userId: string) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     const weekEnd = new Date(today);
//     weekEnd.setDate(today.getDate() + 6);

//     const { data: tasks } = await supabase
//       .from("daily_tasks")
//       .select("*")
//       .eq("user_id", userId)
//       .gte("scheduled_for", today.toISOString().split("T")[0])
//       .lte("scheduled_for", weekEnd.toISOString().split("T")[0])
//       .order("scheduled_for", { ascending: true });

//     return tasks || [];
//   }
// }

// export const dailyTaskService = new DailyTaskService();






















import { supabase } from "../../data/supabase.client.js";

export class DailyTaskService {
  // =========================================================
  // GENERATE WEEKLY TASKS
  // =========================================================

  async generateWeeklyTasks(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksGenerated = [];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split("T")[0];

      const task = await this.generateDailyTasks(userId, dateStr);
      if (task) {
        tasksGenerated.push(task);
      }
    }

    return tasksGenerated;
  }

  // =========================================================
  // GENERATE DAILY TASKS
  // =========================================================

  async generateDailyTasks(userId: string, targetDateStr?: string) {
    const today = new Date();
    const todayStr = targetDateStr || today.toISOString().split("T")[0];

    const { data: existingTasks } = await supabase
      .from("daily_tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("scheduled_for", todayStr);

    if (existingTasks && existingTasks.length > 0) {
      return existingTasks;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_study_minutes")
      .eq("id", userId)
      .single();

    const dailyMinutes = profile?.daily_study_minutes || 120;

    const { data: goal } = await supabase
      .from("user_goals")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!goal) {
      throw new Error("Goal not found");
    }

    const { data: roadmap } = await supabase
      .from("roadmaps")
      .select("id")
      .eq("goal_id", goal.id)
      .single();

    if (!roadmap) {
      throw new Error("Roadmap not found");
    }

    const { data: currentTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("roadmap_id", roadmap.id)
      .eq("completed", false)
      .order("task_order", { ascending: true })
      .limit(1)
      .single();

    if (!currentTask) {
      return null;
    }

    const remainingMinutes =
      currentTask.estimated_minutes - (currentTask.progress_minutes || 0);

    if (remainingMinutes <= 0) {
      return null;
    }

    const sessionMinutes = Math.min(dailyMinutes, remainingMinutes);

    const { data: dailyTask, error } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: userId,
        roadmap_task_id: currentTask.id,
        title: currentTask.title,
        scheduled_for: todayStr,
        session_minutes: sessionMinutes,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return dailyTask;
  }

  // =========================================================
  // ENSURE WEEKLY PLAN EXISTS
  // =========================================================

  async ensureWeeklyPlan(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: futureTasks } = await supabase
      .from("daily_tasks")
      .select("scheduled_for")
      .eq("user_id", userId)
      .gte("scheduled_for", today.toISOString().split("T")[0])
      .order("scheduled_for", { ascending: true });

    const existingDates = new Set(
      futureTasks?.map((task) => task.scheduled_for) || []
    );

    const tasksGenerated = [];
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split("T")[0];

      if (!existingDates.has(dateStr)) {
        const task = await this.generateDailyTasks(userId, dateStr);
        if (task) {
          tasksGenerated.push(task);
        }
      }
    }

    return tasksGenerated;
  }

  // =========================================================
  // GENERATE NEXT WEEK (GUARDED)
  // =========================================================

  async generateNextWeeklyPlan(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 6);

    const { data: remainingTasks } = await supabase
      .from("daily_tasks")
      .select("id")
      .eq("user_id", userId)
      .gte("scheduled_for", today.toISOString().split("T")[0])
      .lte("scheduled_for", weekEnd.toISOString().split("T")[0])
      .eq("completed", false);

    if ((remainingTasks?.length || 0) > 4) {
      throw new Error("Complete more tasks before generating next week.");
    }

    const nextWeekStart = new Date(today);
    nextWeekStart.setDate(today.getDate() + 7);
    const nextWeekEnd = new Date(today);
    nextWeekEnd.setDate(today.getDate() + 13);

    const nextWeekStartStr = nextWeekStart.toISOString().split("T")[0];
    const nextWeekEndStr = nextWeekEnd.toISOString().split("T")[0];

    const { data: existingNextWeek } = await supabase
      .from("daily_tasks")
      .select("scheduled_for")
      .eq("user_id", userId)
      .gte("scheduled_for", nextWeekStartStr)
      .lte("scheduled_for", nextWeekEndStr)
      .order("scheduled_for", { ascending: true });

    if ((existingNextWeek?.length || 0) > 0) {
      return {
        generated: [],
        skipped: true,
        reason: "First complete pending tasks.",
      };
    }

    const tasksGenerated = [];
    for (let i = 7; i < 14; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = targetDate.toISOString().split("T")[0];

      const task = await this.generateDailyTasks(userId, dateStr);
      if (task) {
        tasksGenerated.push(task);
      }
    }

    return {
      generated: tasksGenerated,
      skipped: false,
    };
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

    if (!dailyTask) {
      throw new Error("Daily task not found");
    }

    if (dailyTask.completed) {
      return dailyTask;
    }

    // =========================================================
    // MARK DAILY TASK COMPLETE
    // =========================================================
    const { data, error } = await supabase
      .from("daily_tasks")
      .update({
        completed: true,
        completed_at: new Date(),
      })
      .eq("id", dailyTaskId)
      .select();

    console.log(data);
    console.log(error);

    // =========================================================
    // UPDATE ROADMAP TASK PROGRESS
    // =========================================================

    const { data: roadmapTask } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", dailyTask.roadmap_task_id)
      .single();

    const newProgress =
      (roadmapTask?.progress_minutes || 0) + dailyTask.session_minutes;

    const isCompleted = newProgress >= roadmapTask.estimated_minutes;

    await supabase
      .from("tasks")
      .update({
        progress_minutes: newProgress,
        completed: isCompleted,
        completed_at: isCompleted ? new Date() : null,
      })
      .eq("id", roadmapTask.id);

    // =========================================================
    // FEATURE 5: ACCOUNTABILITY ENGINE
    // Wire score update to task completion source of truth
    // =========================================================
    const { data: membership } = await supabase
      .from("circle_members")
      .select("id, accountability_score, weekly_completion")
      .eq("user_id", userId)
      .maybeSingle();

    if (membership) {
      await supabase
        .from("circle_members")
        .update({
          accountability_score: (membership.accountability_score || 0) + 2,
          weekly_completion: (membership.weekly_completion || 0) + 1,
          last_active_at: new Date().toISOString(),
        })
        .eq("id", membership.id);
    }

    // =========================================================
    // INSERT ACTIVITY LOG
    // =========================================================

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const todayStart = `${todayStr}T00:00:00.000Z`;
    const todayEnd = `${todayStr}T23:59:59.999Z`;

    const { data: existingActivity, error: activityCheckError } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("user_id", userId)
      .gte("created_at", todayStart)
      .lte("created_at", todayEnd)
      .maybeSingle();

    console.log("Checking for existing activity log:", {
      userId,
      todayStart,
      todayEnd,
      existingActivity,
      activityCheckError,
    });

    if (!existingActivity) {
      const { data: newActivity, error: insertError } = await supabase
        .from("activity_logs")
        .insert({
          user_id: userId,
          created_at: now.toISOString(),
          metadata_json: { type: "task_completed", daily_task_id: dailyTaskId },
        })
        .select()
        .single();

      console.log("Inserted new activity log:", {
        newActivity,
        insertError,
      });
    }

    // =========================================================
    // ENSURE WEEKLY PLAN IS MAINTAINED
    // =========================================================

    if (isCompleted) {
      await this.ensureWeeklyPlan(userId);
    }

    return {
      success: true,
    };
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
      .gte("scheduled_for", today.toISOString().split("T")[0])
      .lte("scheduled_for", weekEnd.toISOString().split("T")[0])
      .order("scheduled_for", { ascending: true });

    return tasks || [];
  }
}

export const dailyTaskService = new DailyTaskService();