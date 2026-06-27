import { roadmapSchema } from "./roadmap.schema.js";
import { buildRoadmapPrompt } from "../ai/prompts/roadmap.prompt.js";
import { OpenAIService } from "../ai/openai.service.js";

import { dailyTaskService } from "../dailytask/dailytask.service.js";

import { supabase } from "../../data/supabase.client.js";
import { ExecutionCircleService } from "../executioncircle/executioncircle.service.js";

export class RoadmapService {
  static async getRoadmapByGoalId(goalId: string) {
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("goal_id", goalId)
      .single();

    if (error) throw error;

    return data;
  }

  // =========================================================
  // GET PHASES WITH TASKS
  // CHANGE: now reads completion_percentage from phase_progress
  // view instead of roadmap_phases directly, so it's always
  // accurate and never stale.
  // =========================================================

  static async getPhasesWithTasks(roadmapId: string) {
    const { data: phases, error: phasesError } = await supabase
      .from("phase_progress")
      .select("*")
      .eq("roadmap_id", roadmapId)
      .order("phase_order", { ascending: true });

    if (phasesError) throw phasesError;

    const phasesWithTasks = await Promise.all(
      (phases || []).map(async (phase) => {
        const { data: tasks, error: tasksError } = await supabase
          .from("tasks")
          .select("*")
          .eq("phase_id", phase.id)
          .order("task_order", { ascending: true });

        if (tasksError) throw tasksError;

        return {
          ...phase,
          tasks: tasks || [],
        };
      }),
    );

    return phasesWithTasks;
  }

  static async createRoadmap(data: any) {
    const { data: roadmap, error } = await supabase
      .from("roadmaps")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return roadmap;
  }

  static async createPhase(data: any) {
    const { data: phase, error } = await supabase
      .from("roadmap_phases")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return phase;
  }

  // =========================================================
  // CREATE TASK
  // CHANGE 1: removed goal_id — column was dropped from tasks.
  //           goal is now resolved via tasks -> roadmaps -> user_goals.
  // CHANGE 2: removed completed boolean — column was dropped.
  //           status is the single source of truth ('PENDING' by default).
  //           The sync_task_completion trigger handles transitions
  //           to IN_PROGRESS / COMPLETED automatically.
  // =========================================================

  static async createTask(data: any) {
    const { error } = await supabase.from("tasks").insert(data);

    if (error) throw error;
  }

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
    const { data: goal, error } = await supabase
      .from("user_goals")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return goal;
  }

  static async getRoadmap(userId: string) {
    // =========================================================
    // GET USER GOAL
    // =========================================================

    const goal = await RoadmapService.getLatestGoal(userId);
    if (!goal) {
      throw new Error("No goal found");
    }

    // =========================================================
    // GET ROADMAP
    // =========================================================

    const roadmap = await RoadmapService.getRoadmapByGoalId(goal.id);

    if (!roadmap) {
      throw new Error("No roadmap found");
    }

    // =========================================================
    // GET PHASES WITH TASKS
    // (reads from phase_progress view — always up to date)
    // =========================================================

    const phases = await RoadmapService.getPhasesWithTasks(roadmap.id);

    return {
      success: true,
      data: {
        roadmap: {
          id: roadmap.id,
          title: roadmap.title,
          createdAt: roadmap.created_at,
        },
        goal: {
          id: goal.id,
          title: goal.title,
          currentLevel: goal.current_level,
        },
        phases,
      },
    };
  }

  static async generateRoadmap(userId: string, input: any) {
    // 0 - REFINE GOAL TITLE AND GET PREMIUM CIRCLE NAME VIA AI
    let refinedGoal = input.goal;
    let aiCircleName = "";
    try {
      const details = await OpenAIService.determineCircleDetails(
        input.goal,
        input.currentLevel,
      );
      refinedGoal = details.refined_goal_title;
      aiCircleName = details.circle_name;
    } catch (e) {
      console.error("AI goal refinement failed, using raw goal:", e);
    }

    // 1 - CREATE USER GOAL
    const goal = await RoadmapService.createGoal({
      user_id: userId,
      title: refinedGoal,
      current_level: input.currentLevel,
    });

    // 2 - BUILD AI PROMPT
    const prompt = await buildRoadmapPrompt(input);

    input.goal = refinedGoal;
    // 3 - GENERATE AI ROADMAP
    const aiResponse = await OpenAIService.generateRoadmap(prompt);
    if (!aiResponse) {
      throw new Error("AI response empty");
    }


    // 4 - PARSE + VALIDATE
    const parsed = roadmapSchema.parse(JSON.parse(aiResponse));

    // 5 - VALIDATE PHASE WORKLOAD
    const totalMinutes = parsed.phases.reduce(
      (phaseAcc, phase) =>
        phaseAcc +
        phase.tasks.reduce(
          (taskAcc, task) => taskAcc + task.estimated_minutes,
          0,
        ),
      0,
    );

    const expectedMinutes =
      input.durationMonths * 30 * ((input.dailyHours ?? 2) * 60);

    if (totalMinutes < expectedMinutes * 0.85) {
      throw new Error(
        `Roadmap too short. Generated ${
          totalMinutes / 60
        } hours but expected at least ${
          Math.floor(expectedMinutes * 0.85) / 60
        } hours`,
      );
    }
    for (const phase of parsed.phases) {
      const totalMinutes = phase.tasks.reduce(
        (acc, task) => acc + task.estimated_minutes,
        0,
      );
      const maxMinutes =
        phase.duration_weeks * 7 * (input.dailyHours ?? 2) * 60;
      if (totalMinutes > maxMinutes * 1.2) {
        throw new Error(`Unrealistic workload in phase: ${phase.title}`);
      }
    }

    // 6 - CREATE ROADMAP
    const roadmap = await RoadmapService.createRoadmap({
      goal_id: goal.id,
      title: parsed.roadmap_title,
    });

    // 7 - INSERT PHASES + TASKS
    // CHANGE: taskPayload no longer includes goal_id or completed.
    // status defaults to 'PENDING' at the DB level.
    // The sync_task_completion trigger will automatically move it
    // to IN_PROGRESS / COMPLETED as progress_minutes is updated.
    for (const [phaseIndex, phase] of parsed.phases.entries()) {
      const phasePayload = {
        roadmap_id: roadmap.id,
        title: phase.title,
        description: phase.description,
        estimated_days: phase.duration_weeks * 7,
        phase_order: phaseIndex + 1,
      };

      const createdPhase = await RoadmapService.createPhase(phasePayload);

      for (const [taskIndex, task] of phase.tasks.entries()) {
        // =========================================================
        // CHANGE: removed goal_id and completed from payload.
        // goal is resolved via roadmap_id -> roadmaps -> user_goals.
        // status is omitted so DB default 'PENDING' applies.
        // =========================================================
        const taskPayload = {
          roadmap_id: roadmap.id,
          phase_id: createdPhase.id,
          title: task.title,
          description: task.description,
          estimated_minutes: task.estimated_minutes,
          difficulty: task.difficulty,
          task_order: task.task_order || taskIndex + 1,
          progress_minutes: 0,
        };
        await RoadmapService.createTask(taskPayload);
      }
    }

    // 8 - GENERATE FIRST WEEKLY PLAN
    // CHANGE: was generateDailyTasks (single day) — now generates
    // the full first week so the user has a complete plan on day 1.
    await dailyTaskService.generateWeeklyTasks(userId);

    // =========================================================
    // 9 - AUTO MATCH EXECUTION CIRCLE
    // =========================================================
    try {
      const circleService = new ExecutionCircleService(supabase);

      const durationMonths = parseInt(input.duration, 10) || 6;

      await circleService.autoMatchCircle(
        userId,
        refinedGoal,
        durationMonths,
        input.currentLevel,
        aiCircleName,
      );
      console.log("Execution circle matched successfully");
    } catch (error) {
      console.error("Execution circle creation failed:", error);
    }

    // 10 - MARK ONBOARDING COMPLETE
    await supabase
      .from("profiles")
      .update({
        daily_study_minutes: input.dailyHours * 60,
        is_onboarding_completed: true,
      })
      .eq("id", userId);

    return {
      success: true,
      goalId: goal.id,
      roadmapId: roadmap.id,
    };
  }
}
