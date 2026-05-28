import { roadmapSchema } from "./roadmap.schema.js";

import { buildFaangPrompt } from "../ai/prompts/faang.prompt.js";

import { OpenAIService } from "../ai/openai.service.js";

import { GoalRepository } from "../../data/repositories/goal.repository.js";

import { RoadmapRepository } from "../../data/repositories/roadmap.repository.js";

import { dailyTaskService } from "../dailytask/dailytask.service.js";

export class RoadmapService {
  static async getRoadmap(userId: string) {
    // =========================================================
    // GET USER GOAL
    // =========================================================

    const goal = await GoalRepository.getLatestGoal(userId);

    if (!goal) {
      throw new Error("No goal found");
    }

    // =========================================================
    // GET ROADMAP
    // =========================================================

    const roadmap = await RoadmapRepository.getRoadmapByGoalId(goal.id);

    if (!roadmap) {
      throw new Error("No roadmap found");
    }

    // =========================================================
    // GET PHASES WITH TASKS
    // =========================================================

    const phases = await RoadmapRepository.getPhasesWithTasks(roadmap.id);

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
    // =========================================================
    // STEP 1 - CREATE USER GOAL
    // =========================================================

    const goal = await GoalRepository.createGoal({
      user_id: userId,

      title: input.goal,

      current_level: input.currentLevel,
    });

    // =========================================================
    // STEP 2 - BUILD AI PROMPT
    // =========================================================

    const prompt = buildFaangPrompt(input);

    // =========================================================
    // STEP 3 - GENERATE AI ROADMAP
    // =========================================================

    const aiResponse = await OpenAIService.generateRoadmap(prompt);

    if (!aiResponse) {
      throw new Error("AI response empty");
    }

    console.log("AI RESPONSE:");
    console.log(aiResponse);

    // =========================================================
    // STEP 4 - PARSE + VALIDATE
    // =========================================================

    const parsed = roadmapSchema.parse(JSON.parse(aiResponse));

    // =========================================================
    // STEP 5 - VALIDATE PHASE WORKLOAD
    // =========================================================

    for (const phase of parsed.phases) {
      const totalMinutes = phase.tasks.reduce(
        (acc, task) => acc + task.estimated_minutes,
        0,
      );

      const maxMinutes =
        phase.duration_weeks * 7 * (input.dailyStudyMinutes || 120);

      // allow 20% flexibility

      if (totalMinutes > maxMinutes * 1.2) {
        throw new Error(`Unrealistic workload in phase: ${phase.title}`);
      }
    }

    // =========================================================
    // STEP 6 - CREATE ROADMAP
    // =========================================================

    const roadmap = await RoadmapRepository.createRoadmap({
      goal_id: goal.id,

      title: parsed.roadmap_title,
    });

    // =========================================================
    // STEP 7 - INSERT PHASES + TASKS
    // =========================================================

    for (const [phaseIndex, phase] of parsed.phases.entries()) {
      console.log("INSERTING PHASE:");
      console.log(phase.title);

      const phasePayload = {
        roadmap_id: roadmap.id,

        title: phase.title,

        description: phase.description,

        estimated_days: phase.duration_weeks * 7,

        phase_order: phaseIndex + 1,
      };

      const createdPhase = await RoadmapRepository.createPhase(phasePayload);

      console.log("PHASE CREATED:");
      console.log(createdPhase);

      // =====================================================
      // INSERT TASKS
      // =====================================================

      for (const [taskIndex, task] of phase.tasks.entries()) {
        console.log("INSERTING TASK:");
        console.log(task.title);

        const taskPayload = {
          goal_id: goal.id,

          roadmap_id: roadmap.id,

          phase_id: createdPhase.id,

          title: task.title,

          description: task.description,

          estimated_minutes: task.estimated_minutes,

          difficulty: task.difficulty,

          task_order: task.task_order || taskIndex + 1,

          progress_minutes: 0,

          completed: false,
        };

        await RoadmapRepository.createTask(taskPayload);

        console.log("TASK CREATED");
      }
    }

    // =========================================================
    // STEP 8 - GENERATE FIRST DAILY TASK
    // =========================================================

    await dailyTaskService.generateDailyTasks(userId);

    // =========================================================
    // RETURN
    // =========================================================

    return {
      success: true,

      goalId: goal.id,

      roadmapId: roadmap.id,
    };
  }
}
