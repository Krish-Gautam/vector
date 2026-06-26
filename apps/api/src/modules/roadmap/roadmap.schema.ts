import { z } from "zod";

export const roadmapSchema = z.object({
  roadmap_title: z.string().trim().min(1),

  phases: z.array(
    z.object({
      title: z.string().trim().min(1),

      description: z.string().trim().min(1),

      duration_weeks: z.number().int().positive(),

      tasks: z.array(
        z.object({
          title: z.string().trim().min(1),

          description: z.string().trim().min(1),

          estimated_minutes: z.number().int().positive(),

          task_order: z.number().int().positive(),

          difficulty: z.enum([
            "EASY",
            "MEDIUM",
            "HARD",
          ]),
        })
      ).min(1),
    })
  ).min(1),
});

export type RoadmapType =
  z.infer<typeof roadmapSchema>;