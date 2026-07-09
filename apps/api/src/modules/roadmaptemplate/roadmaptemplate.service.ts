import { supabase } from "../../data/supabase.client.js";
import { OpenAIService } from "../ai/openai.service.js";

const SIMILARITY_THRESHOLD = 0.15; // cosine distance, tune after real usage data

export class RoadmapTemplateService {
  static readonly NON_TEMPLATABLE_CATEGORIES = ["General"];

  static async findMatchingTemplate(category: string, level: string) {
    if (this.NON_TEMPLATABLE_CATEGORIES.includes(category)) {
      return null; // force AI generation, always
    }
    const embedding = await OpenAIService.getEmbedding(`${category} ${level}`);

    const { data, error } = await supabase.rpc("match_roadmap_category", {
      query_embedding: embedding,
      match_threshold: SIMILARITY_THRESHOLD,
    });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    const categoryRow = data[0];

    const { data: template, error: templateError } = await supabase
      .from("roadmap_templates")
      .select("*, roadmap_template_phases(*, roadmap_template_tasks(*))")
      .eq("category_id", categoryRow.id)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (templateError) return null; // no template yet for this category, still a miss
    return { categoryRow, template };
  }

  static instantiate(
    template: any,
    durationMonths: number,
    dailyHours: number,
  ) {
    const totalWeeks = durationMonths * 4;
    const totalMinutes = durationMonths * 30 * dailyHours * 60;
    const phases = template.roadmap_template_phases.sort(
      (a: any, b: any) => a.phase_order - b.phase_order,
    );

    const baseWeeks = Math.floor(totalWeeks / phases.length);
    let remainingWeeks = totalWeeks % phases.length;

    return phases.map((phase: any) => {
      const durationWeeks = baseWeeks + (remainingWeeks-- > 0 ? 1 : 0);
      const phaseMinutes = Math.round(totalMinutes * phase.weight);

      const tasks = phase.roadmap_template_tasks.sort(
        (a: any, b: any) => a.task_order - b.task_order,
      );

      let allocated = 0;
      const scaledTasks = tasks.map((task: any, j: number) => {
        let minutes =
          j === tasks.length - 1
            ? phaseMinutes - allocated
            : Math.round(phaseMinutes * task.weight);
        allocated += minutes;
        return {
          title: task.title,
          description: task.description,
          difficulty: task.difficulty,
          estimated_minutes: Math.max(minutes, 5),
          task_order: j + 1,
        };
      });

      return {
        title: phase.title,
        description: phase.description,
        estimated_days: durationWeeks * 7,
        phase_order: phase.phase_order,
        tasks: scaledTasks,
      };
    });
  }

  // called fire-and-forget after a successful AI generation
  static async saveAsTemplate(parsed: any, category: string, level: string) {
    if (this.NON_TEMPLATABLE_CATEGORIES.includes(category)) {
      console.log(
        `Skipping template save — category "${category}" is not templatable`,
      );
      return;
    }
    try {
      const embedding = await OpenAIService.getEmbedding(
        `${category} ${level}`,
      );

      const { data: categoryRow } = await supabase
        .from("roadmap_template_categories")
        .upsert(
          { category_name: category, level, embedding },
          { onConflict: "category_name,level" },
        )
        .select()
        .single();

      const totalMinutes = parsed.phases.reduce(
        (a: number, p: any) =>
          a + p.tasks.reduce((b: number, t: any) => b + t.estimated_minutes, 0),
        0,
      );

      const { data: template } = await supabase
        .from("roadmap_templates")
        .insert({
          category_id: categoryRow.id,
          title: parsed.roadmap_title,
          base_total_minutes: totalMinutes,
          base_duration_weeks: parsed.phases.length, // adjust if you track actual weeks
        })
        .select()
        .single();

      for (const [i, phase] of parsed.phases.entries()) {
        const phaseMinutes = phase.tasks.reduce(
          (a: number, t: any) => a + t.estimated_minutes,
          0,
        );

        const { data: phaseRow } = await supabase
          .from("roadmap_template_phases")
          .insert({
            template_id: template.id,
            phase_order: i + 1,
            title: phase.title,
            description: phase.description,
            weight: phaseMinutes / totalMinutes,
          })
          .select()
          .single();

        const taskRows = phase.tasks.map((task: any, j: number) => ({
          template_phase_id: phaseRow.id,
          task_order: j + 1,
          title: task.title,
          description: task.description,
          difficulty: task.difficulty,
          weight: task.estimated_minutes / phaseMinutes,
        }));

        await supabase.from("roadmap_template_tasks").insert(taskRows);
      }
    } catch (err) {
      console.error("saveAsTemplate failed (non-blocking):", err);
    }
  }
}
