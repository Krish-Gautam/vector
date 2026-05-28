import { supabase } from "../supabase.client.js";

export class RoadmapRepository {
  static async getRoadmapByGoalId(goalId: string) {
    const { data, error } = await supabase
      .from("roadmaps")
      .select("*")
      .eq("goal_id", goalId)
      .single();

    if (error) throw error;

    return data;
  }

  static async getPhasesWithTasks(roadmapId: string) {
    const { data: phases, error: phasesError } = await supabase
      .from("roadmap_phases")
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
      })
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

  static async createTask(data: any) {
    const { error } = await supabase.from("tasks").insert(data);

    if (error) throw error;
  }
}
