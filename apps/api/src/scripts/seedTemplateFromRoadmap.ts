import { supabase } from "../data/supabase.client.js";
import { OpenAIService } from "../modules/ai/openai.service.js";

async function seedTemplateFromRoadmap(
  roadmapId: string,
  category: string,
  level: string,
) {
  // 1 - Fetch the roadmap
  const { data: roadmap, error: roadmapErr } = await supabase
    .from("roadmaps")
    .select("*")
    .eq("id", roadmapId)
    .single();
  if (roadmapErr) throw roadmapErr;

  // 2 - Fetch phases (ordered)
  const { data: phases, error: phasesErr } = await supabase
    .from("roadmap_phases")
    .select("*")
    .eq("roadmap_id", roadmapId)
    .order("phase_order", { ascending: true });
  if (phasesErr) throw phasesErr;
  if (!phases || phases.length === 0) throw new Error("No phases found for this roadmap");

  // 3 - Fetch tasks for each phase, compute minutes
  const phasesWithTasks = await Promise.all(
    phases.map(async (phase) => {
      const { data: tasks, error: tasksErr } = await supabase
        .from("tasks")
        .select("*")
        .eq("phase_id", phase.id)
        .order("task_order", { ascending: true });
      if (tasksErr) throw tasksErr;
      return { ...phase, tasks: tasks || [] };
    }),
  );

  const totalMinutes = phasesWithTasks.reduce(
    (a, p) => a + p.tasks.reduce((b: number, t: any) => b + t.estimated_minutes, 0),
    0,
  );
  if (totalMinutes === 0) throw new Error("Roadmap has zero total minutes, cannot compute weights");

  // 4 - Get or create the category (with embedding)
  const embedding = await OpenAIService.getEmbedding(`${category} ${level}`);

  const { data: categoryRow, error: catErr } = await supabase
    .from("roadmap_template_categories")
    .upsert(
      { category_name: category, level, embedding },
      { onConflict: "category_name,level" },
    )
    .select()
    .single();
  if (catErr) throw catErr;

  // 5 - Create the template row
  const { data: template, error: templateErr } = await supabase
    .from("roadmap_templates")
    .insert({
      category_id: categoryRow.id,
      title: roadmap.title,
      base_total_minutes: totalMinutes,
      base_duration_weeks: phasesWithTasks.reduce(
        (a, p) => a + Math.round(p.estimated_days / 7),
        0,
      ),
    })
    .select()
    .single();
  if (templateErr) throw templateErr;

  // 6 - Create phase + task rows with computed weights
  for (const [i, phase] of phasesWithTasks.entries()) {
    const phaseMinutes = phase.tasks.reduce(
      (a: number, t: any) => a + t.estimated_minutes,
      0,
    );
    if (phaseMinutes === 0) {
      console.warn(`Phase "${phase.title}" has 0 minutes — skipping tasks, weight will be 0`);
    }

    const { data: phaseRow, error: phaseErr } = await supabase
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
    if (phaseErr) throw phaseErr;

    if (phase.tasks.length > 0 && phaseMinutes > 0) {
      const taskRows = phase.tasks.map((task: any, j: number) => ({
        template_phase_id: phaseRow.id,
        task_order: j + 1,
        title: task.title,
        description: task.description,
        difficulty: task.difficulty,
        weight: task.estimated_minutes / phaseMinutes,
      }));

      const { error: taskErr } = await supabase
        .from("roadmap_template_tasks")
        .insert(taskRows);
      if (taskErr) throw taskErr;
    }
  }

  console.log(`✅ Template created: "${template.title}" (${category}/${level}), id=${template.id}`);
  return template;
}

// ---- Run it ----
const ROADMAP_ID = process.argv[2];
const CATEGORY = process.argv[3];
const LEVEL = process.argv[4];

if (!ROADMAP_ID || !CATEGORY || !LEVEL) {
  console.error("Usage: node seedTemplateFromRoadmap.js <roadmapId> <category> <level>");
  process.exit(1);
}

seedTemplateFromRoadmap(ROADMAP_ID, CATEGORY, LEVEL)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });