import { z } from "zod";

export const roadmapSchema = z.object({
  roadmap_title: z.string(),

  phases: z.array(
    z.object({
      title: z.string(),

      description: z.string(),

      duration_weeks: z.number(),

      tasks: z.array(
        z.object({
          title: z.string(),

          description: z.string(),

          estimated_minutes: z.number(),

          task_order: z.number(),

          difficulty: z.enum([
            "EASY",
            "MEDIUM",
            "HARD",
          ]),
        })
      ),
    })
  ),
});

export type RoadmapType =
  z.infer<typeof roadmapSchema>;