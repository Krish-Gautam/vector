import { roadmapSchema } from "./roadmap.schema.js";
import { buildRoadmapPrompt } from "../ai/prompts/roadmap.prompt.js";
import { OpenAIService } from "../ai/openai.service.js";
import { RoadmapTemplateService } from "../roadmaptemplate/roadmaptemplate.service.js";
import { dailyTaskService } from "../dailytask/dailytask.service.js";

import { supabase } from "../../data/supabase.client.js";
import { ExecutionCircleService } from "../executioncircle/executioncircle.service.js";

interface GenerateRoadmapInput {
  goal: string;
  currentLevel: string;
  duration: number;
  dailyHours: number;
}

export class RoadmapService {
  static async updateRoadmapStatus(
    userId: string,
    status: "idle" | "generating" | "ready" | "failed",
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({
        roadmap_status: status,
      })
      .eq("id", userId);

    if (error) throw error;
  }

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

  static async deleteGoal(goalId: string) {
    const { error } = await supabase
      .from("user_goals")
      .delete()
      .eq("id", goalId);

    if (error) throw error;
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

  static async generateRoadmap(userId: string, input: GenerateRoadmapInput) {
    let goal: Awaited<ReturnType<typeof RoadmapService.createGoal>> | null =
      null;
    console.log("\n================ ROADMAP GENERATION START ================");
    console.log("User:", userId);
    console.log("Input:", input);

    const { data, error } = await supabase.rpc("lock_roadmap_generation", {
      p_user_id: userId,
    });

    console.log("RPC result:", data);
    console.log("RPC error:", error);

    if (error) {
      console.error("RPC FAILED");
      throw error;
    }

    if (!data) {
      console.error("Roadmap generation blocked by lock function");
      throw new Error(
        "Roadmap generation already in progress or roadmap already exists.",
      );
    }

    console.log("Roadmap lock acquired successfully");

    console.log("Profile status -> generating");
    await RoadmapService.updateRoadmapStatus(userId, "generating");
    try {
      // =========================================================
      // STEP 1 - REFINE GOAL + GET CATEGORY + CIRCLE NAME
      // =========================================================
      let refinedGoal = input.goal;
      let aiCircleName = "";
      let goalCategory = refinedGoal;
      console.log("\n---- STEP 1 : AI Goal Refinement ----");
      try {
        const details = await OpenAIService.determineCircleDetails(
          input.goal,
          input.currentLevel,
        );

        refinedGoal = details.refined_goal_title;
        aiCircleName = details.circle_name;
        goalCategory = details.goal_category ?? "General";
      } catch (e) {
        console.error("AI goal refinement failed:", e);
        refinedGoal = input.goal;
        aiCircleName = "";
        goalCategory = "General";
      }
      console.log("Refined Goal:", refinedGoal);
      console.log("Circle:", aiCircleName);
      console.log("Category:", goalCategory);

      input.goal = refinedGoal;

      // =========================================================
      // STEP 2 - TEMPLATE MATCH OR AI GENERATION
      // =========================================================
      console.log("\n---- STEP 2 : Template Match / AI Generation ----");

      const match = await RoadmapTemplateService.findMatchingTemplate(
        goalCategory,
        input.currentLevel,
      );

      let parsed: any;
      let isTemplateMiss = false;

      if (match) {
        console.log("Template HIT:", match.template.title);
        const phases = RoadmapTemplateService.instantiate(
          match.template,
          input.duration,
          input.dailyHours,
        );
        parsed = { roadmap_title: match.template.title, phases };

        // non-blocking usage stats update
        supabase
          .from("roadmap_templates")
          .update({
            usage_count: match.template.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", match.template.id)
          .then(() => {});
      } else {
        console.log("Template MISS — calling OpenAI");
        isTemplateMiss = true;
        const prompt = await buildRoadmapPrompt(input);
        const aiResponse = await OpenAIService.generateRoadmap(prompt);
        if (!aiResponse) throw new Error("AI response empty");
        console.log("OpenAI response received");
        console.log(aiResponse.substring(0, 500) + "...");

        const raw = JSON.parse(aiResponse);
        console.log(
          raw.phases.map((p: any, i: number) => ({
            phase: i + 1,
            title: p.title,
          })),
        );

        parsed = roadmapSchema.parse(raw);
        console.log("Roadmap parsed successfully");
        console.log("Title:", parsed.roadmap_title);
        console.log("Phases:", parsed.phases.length);
      }

      // =========================================================
      // STEP 3 - VALIDATE PHASE WORKLOAD
      // =========================================================
      const totalMinutes = parsed.phases.reduce(
        (phaseAcc: number, phase: any) =>
          phaseAcc +
          phase.tasks.reduce(
            (taskAcc: number, task: any) => taskAcc + task.estimated_minutes,
            0,
          ),
        0,
      );

      const durationMonths = Number(input.duration);
      const expectedMinutes =
        durationMonths * 30 * ((input.dailyHours ?? 2) * 60);

      if (durationMonths <= 0) {
        throw new Error("Invalid duration");
      }
      if (input.dailyHours <= 0) {
        throw new Error("Invalid study hours");
      }
      if (totalMinutes < expectedMinutes * 0.85) {
        throw new Error(
          `Roadmap too short. Generated ${
            totalMinutes / 60
          } hours but expected at least ${
            Math.floor(expectedMinutes * 0.85) / 60
          } hours`,
        );
      }

      // =========================================================
      // STEP 4 - CREATE USER GOAL
      // =========================================================
      console.log("\n---- STEP 4 : Creating Goal ----");
      goal = await RoadmapService.createGoal({
        user_id: userId,
        title: refinedGoal,
        category: goalCategory,
        current_level: input.currentLevel,
      });
      console.log("Goal created");
      console.log(goal);

      // =========================================================
      // STEP 5 - CREATE ROADMAP
      // =========================================================
      console.log("\n---- STEP 5 : Creating Roadmap ----");
      const roadmap = await RoadmapService.createRoadmap({
        goal_id: goal.id,
        title: parsed.roadmap_title,
      });
      console.log("Roadmap created");
      console.log(roadmap);

      // =========================================================
      // STEP 6 - INSERT PHASES + TASKS
      // CHANGE: taskPayload no longer includes goal_id or completed.
      // status defaults to 'PENDING' at the DB level.
      // The sync_task_completion trigger will automatically move it
      // to IN_PROGRESS / COMPLETED as progress_minutes is updated.
      // =========================================================
      console.log("\n---- STEP 6 : Inserting Phases + Tasks ----");
      const totalWeeks = input.duration * 4;
      const phaseCount = parsed.phases.length;

      const baseWeeks = Math.floor(totalWeeks / phaseCount);
      let remainingWeeks = totalWeeks % phaseCount;
      for (const [phaseIndex, phase] of parsed.phases.entries()) {
        const durationWeeks = baseWeeks + (remainingWeeks-- > 0 ? 1 : 0);

        const phasePayload = {
          roadmap_id: roadmap.id,
          title: phase.title,
          description: phase.description,
          estimated_days: durationWeeks * 7,
          phase_order: phaseIndex + 1,
        };
        const createdPhase = await RoadmapService.createPhase(phasePayload);

        for (const [taskIndex, task] of phase.tasks.entries()) {
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

      // =========================================================
      // STEP 7 - SAVE AS TEMPLATE (fire-and-forget, only on a miss)
      // =========================================================
      console.log("\n---- STEP 7 : Template Save (if applicable) ----");
      if (isTemplateMiss) {
        RoadmapTemplateService.saveAsTemplate(
          parsed,
          goalCategory,
          input.currentLevel,
        ).catch((err) => console.error("Template save error:", err));
      }

      // =========================================================
      // STEP 8 - AUTO MATCH EXECUTION CIRCLE
      // =========================================================
      console.log("\n---- STEP 8 : Execution Circle ----");
      try {
        const circleService = new ExecutionCircleService(supabase);

        await circleService.autoMatchCircle(
          userId,
          refinedGoal,
          durationMonths,
          input.currentLevel,
          goalCategory,
          aiCircleName,
        );
        console.log("Execution circle matched successfully");
      } catch (error) {
        console.error("Execution circle creation failed:", error);
      }

      // =========================================================
      // STEP 9 - MARK ONBOARDING COMPLETE
      // =========================================================
      console.log("\n---- STEP 9 : Updating Profile ----");
      await supabase
        .from("profiles")
        .update({
          daily_study_minutes: input.dailyHours * 60,
          is_onboarding_completed: true,
          roadmap_status: "ready",
        })
        .eq("id", userId);
      console.log("Profile updated");

      // =========================================================
      // STEP 10 - GENERATE FIRST WEEKLY PLAN
      // =========================================================
      console.log("\n---- STEP 10 : Weekly Tasks ----");
      await dailyTaskService.generateWeeklyTasks(userId);
      console.log("Weekly tasks generated");

      console.log("Roadmap generation finished successfully");

      return {
        success: true,
        goalId: goal.id,
        roadmapId: roadmap.id,
      };
    } catch (err) {
      try {
        if (goal) {
          await RoadmapService.deleteGoal(goal.id);
        }
      } catch (cleanupError) {
        console.error("Goal cleanup failed:", cleanupError);
      }

      try {
        await RoadmapService.updateRoadmapStatus(userId, "failed");
      } catch (statusError) {
        console.error("Status update failed:", statusError);
      }

      throw err;
    }
  }
}