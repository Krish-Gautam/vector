import { supabase } from "../../data/supabase.client.js";

export class ZoneStatusService {
  /**
   * Calculates the zone status for a user based on consecutive missed scheduled task days.
   * @param userId The ID of the user.
   * @param timezone The user's timezone.
   */
  async calculateZoneStatus(
    userId: string,
    timezone: string = "Asia/Kolkata"
  ): Promise<"ON_TRACK" | "WARNING" | "DANGER"> {
    function todayInTz(tz: string) {
      return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
    }

    const todayStr = todayInTz(timezone);

    // Fetch all daily tasks scheduled up to today
    const { data: dailyTasks, error } = await supabase
      .from("daily_tasks")
      .select("scheduled_for, completed")
      .eq("user_id", userId)
      .lte("scheduled_for", todayStr)
      .order("scheduled_for", { ascending: false });

    if (error) {
      console.error("Error fetching daily tasks for zone status calculation:", error);
      return "ON_TRACK";
    }

    if (!dailyTasks || dailyTasks.length === 0) {
      return "ON_TRACK";
    }

    // Group tasks by scheduled_for date
    const tasksByDate = new Map<string, { total: number; completedCount: number }>();
    for (const task of dailyTasks) {
      const date = task.scheduled_for;
      if (!tasksByDate.has(date)) {
        tasksByDate.set(date, { total: 0, completedCount: 0 });
      }
      const stats = tasksByDate.get(date)!;
      stats.total++;
      if (task.completed) {
        stats.completedCount++;
      }
    }

    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(tasksByDate.keys()).sort((a, b) => b.localeCompare(a));

    let consecutiveMissed = 0;
    for (const date of sortedDates) {
      const stats = tasksByDate.get(date)!;
      const isCompleted = stats.completedCount === stats.total;

      if (date === todayStr) {
        if (isCompleted) {
          // If today's tasks are fully completed, streak of missed days is broken
          break;
        }
        // If today is not completed, we do NOT count it as missed yet, but it doesn't break the streak.
        continue;
      }

      if (isCompleted) {
        // Found a completed scheduled day! The streak of missed days is broken.
        break;
      } else {
        // This day was missed
        consecutiveMissed++;
      }
    }

    if (consecutiveMissed >= 7) {
      return "DANGER";
    } else if (consecutiveMissed >= 3) {
      return "WARNING";
    } else {
      return "ON_TRACK";
    }
  }

  /**
   * Syncs the user's zone status in the database.
   * Updates only if there is a transition in the status to avoid unnecessary database writes.
   * @param userId The ID of the user.
   * @param options Prefetched timezone and goal details to avoid redundant queries.
   */
  async syncZoneStatus(
    userId: string,
    options?: { timezone?: string; currentGoal?: { id: string; zone_status: string } }
  ): Promise<string> {
    try {
      // 1. Get timezone (if not provided)
      let timezone = options?.timezone;
      if (!timezone) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("timezone")
          .eq("id", userId)
          .single();
        timezone = profile?.timezone ?? "Asia/Kolkata";
      }

      // 2. Get active goal and current zone status (if not provided)
      let goalId = options?.currentGoal?.id;
      let currentStatus = options?.currentGoal?.zone_status;

      if (!goalId || !currentStatus) {
        const { data: goal } = await supabase
          .from("user_goals")
          .select("id, zone_status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!goal) {
          return "ON_TRACK";
        }
        goalId = goal.id;
        currentStatus = goal.zone_status;
      }

      // 3. Calculate status
      const newStatus = await this.calculateZoneStatus(userId, timezone);

      // 4. Update if status changed
      if (newStatus !== currentStatus) {
        const { error: updateError } = await supabase
          .from("user_goals")
          .update({
            zone_status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", goalId);

        if (updateError) {
          console.error("Error updating user goal zone status:", updateError);
        }
      }

      return newStatus;
    } catch (err) {
      console.error("Error syncing zone status:", err);
      return "ON_TRACK";
    }
  }
}

export const zoneStatusService = new ZoneStatusService();
