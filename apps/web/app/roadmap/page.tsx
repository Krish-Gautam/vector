"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../lib/api";
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Menu,
  Search,
  Target,
} from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";

interface Task {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  progress_minutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  task_order: number;
  completed: boolean;
}

interface Phase {
  id: string;
  title: string;
  description: string;
  estimated_days: number;
  phase_order: number;
  status: string;
  tasks: Task[];
}

interface RoadmapData {
  success: boolean;
  data: {
    roadmap: {
      id: string;
      title: string;
      createdAt: string;
    };
    goal: {
      id: string;
      title: string;
      currentLevel: string;
    };
    phases: Phase[];
  };
}

export default function RoadmapPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await api.get("/api/roadmap");
        setRoadmapData(response.data);
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmap();
  }, []);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(phaseId)) {
        newSet.delete(phaseId);
      } else {
        newSet.add(phaseId);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "text-green-500 bg-green-500/10";
      case "MEDIUM":
        return "text-yellow-500 bg-yellow-500/10";
      case "HARD":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-zinc-500 bg-zinc-500/10";
    }
  };

  const calculatePhaseProgress = (phase: Phase) => {
    if (phase.tasks.length === 0) return 0;
    const totalMinutes = calculateTotalMinutes(phase.tasks);
    if (totalMinutes === 0) return 0;
    const completedMinutes = calculateCompletedMinutes(phase.tasks);
    return Math.round((completedMinutes / totalMinutes) * 100);
  };

  const calculateTotalMinutes = (tasks: Task[]) => {
    return tasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  };

  const calculateCompletedMinutes = (tasks: Task[]) => {
    return tasks.reduce((sum, task) => sum + (task.progress_minutes || 0), 0);
  };

  const uiVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 260, damping: 24 },
    },
  } as const;

  const roadmap = roadmapData?.data?.roadmap;
  const goal = roadmapData?.data?.goal;
  const phases = roadmapData?.data?.phases || [];

   const phaseById = useMemo(
    () => new Map(phases.map((phase) => [phase.id, phase])),
    [phases],
  );

  const filteredPhases = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesQuery = (value: string) =>
      !normalizedQuery || value.toLowerCase().includes(normalizedQuery);

    return phases
      .map((phase) => {
        const phaseMatches =
          matchesQuery(phase.title) || matchesQuery(phase.description || "");

        const tasks = phase.tasks.filter((task) => {
          const matchesDifficulty =
            difficultyFilter === "ALL" || task.difficulty === difficultyFilter;
          const matchesCompletion = !hideCompleted || !task.completed;
          const matchesText =
            !normalizedQuery ||
            phaseMatches ||
            matchesQuery(task.title) ||
            matchesQuery(task.description || "");

          return matchesDifficulty && matchesCompletion && matchesText;
        });

        if (!normalizedQuery) {
          return { ...phase, tasks };
        }

        if (phaseMatches || tasks.length > 0) {
          return { ...phase, tasks };
        }

        return null;
      })
      .filter((phase): phase is Phase => Boolean(phase));
  }, [difficultyFilter, hideCompleted, phases, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-white animate-pulse delay-75" />
            <div className="h-2 w-2 rounded-full bg-white animate-pulse delay-150" />
          </div>
          <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
            Syncing roadmap...
          </span>
        </div>
      </div>
    );
  }

  if (!roadmapData || !roadmapData.data) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">No roadmap found</p>
          <p className="text-sm text-zinc-500">
            Create a goal to generate your roadmap
          </p>
        </div>
      </div>
    );
  }

 
  const totalTasks = phases.reduce((sum, phase) => sum + phase.tasks.length, 0);
  const completedTasks = phases.reduce(
    (sum, phase) => sum + phase.tasks.filter((t) => t.completed).length,
    0,
  );
  const totalMinutes = phases.reduce(
    (sum, phase) => sum + calculateTotalMinutes(phase.tasks),
    0,
  );
  const completedMinutes = phases.reduce(
    (sum, phase) => sum + calculateCompletedMinutes(phase.tasks),
    0,
  );
  const overallProgress =
    totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;

 

  const handleExpandAll = () => {
    const phaseIds = new Set(phases.map((phase) => phase.id));
    setExpandedPhases((prev) =>
      prev.size === phaseIds.size ? new Set() : phaseIds,
    );
  };

  return (
    <div className="min-h-screen bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
      <div className="flex">
        {/* MOBILE SIDEBAR */}
        <div
          className={`fixed inset-0 z-50 xl:hidden transition-all duration-300 ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[260px] transform bg-[#0A0A0A] border-r border-zinc-900 transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        <Sidebar onNavigate={() => setMobileOpen(false)} />

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 bg-[#070b0a]">
          <motion.div
            variants={uiVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1400px] mx-auto px-4 md:px-8 py-8"
          >
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8 pb-6 border-b border-zinc-900">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                    Roadmap Console
                  </span>
                  <div className="h-1 w-1 rounded-full bg-zinc-600" />
                  <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  {roadmap.title}
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Goal: {goal.title} • Level: {goal.currentLevel}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="xl:hidden p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search phases or tasks"
                    className="w-[220px] md:w-[260px] rounded-xl border border-zinc-800 bg-zinc-950/40 pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <select
                    value={difficultyFilter}
                    onChange={(event) =>
                      setDifficultyFilter(event.target.value)
                    }
                    className="w-[170px] rounded-xl border border-zinc-800 bg-zinc-950/40 pl-9 pr-8 py-2 text-xs text-zinc-200 focus:border-zinc-600 focus:outline-none"
                  >
                    <option value="ALL">All difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <button
                  onClick={() => setHideCompleted((prev) => !prev)}
                  className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950/40 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                >
                  {hideCompleted ? "Show completed" : "Hide completed"}
                </button>
                <button
                  onClick={handleExpandAll}
                  className="px-3 py-2 rounded-xl border border-zinc-800 bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors"
                >
                  {expandedPhases.size === phases.length
                    ? "Collapse all"
                    : "Expand all"}
                </button>
              </div>
            </div>

            {/* PROGRESS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div
                variants={cardVariants}
                className="bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-500" strokeWidth={2} />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {overallProgress}%
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 uppercase">
                  Overall Progress
                </p>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Calendar
                      className="h-5 w-5 text-purple-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {phases.length}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 uppercase">
                  Total Phases
                </p>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2
                      className="h-5 w-5 text-emerald-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 uppercase">
                  Tasks Completed
                </p>
              </motion.div>

              <motion.div
                variants={cardVariants}
                className="bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Clock
                      className="h-5 w-5 text-orange-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {Math.round(
                      phases.reduce(
                        (sum, p) => sum + calculateTotalMinutes(p.tasks),
                        0,
                      ) / 60,
                    )}
                    h
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500 uppercase">
                  Total Time
                </p>
              </motion.div>
            </div>

            <motion.div variants={cardVariants} className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-500 uppercase">
                  Progress {overallProgress}%
                </span>
                <span className="text-xs font-mono text-zinc-600">
                  {filteredPhases.length} of {phases.length} phases visible
                </span>
              </div>
              <div className="h-3 w-full bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden p-[1px]">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
            </motion.div>

            {/* PHASES LIST */}
            <LayoutGroup id="roadmap-phases">
              <motion.div variants={uiVariants} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredPhases.map((phase) => {
                    const isExpanded = expandedPhases.has(phase.id);
                    const basePhase = phaseById.get(phase.id) || phase;
                    const phaseProgress = calculatePhaseProgress(basePhase);
                    const totalMinutes = calculateTotalMinutes(basePhase.tasks);
                    const completedMinutes = calculateCompletedMinutes(
                      basePhase.tasks,
                    );
                    const totalPhaseTasks = basePhase.tasks.length;
                    const visiblePhaseTasks = phase.tasks.length;

                    return (
                      <motion.div
                        key={phase.id}
                        layout
                        variants={cardVariants}
                        className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl overflow-hidden"
                      >
                        {/* PHASE HEADER */}
                        <button
                          onClick={() => togglePhase(phase.id)}
                          className="w-full text-left p-5 hover:bg-zinc-900/40 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronDown
                                    className="h-5 w-5 text-zinc-400"
                                    strokeWidth={2}
                                  />
                                ) : (
                                  <ChevronRight
                                    className="h-5 w-5 text-zinc-400"
                                    strokeWidth={2}
                                  />
                                )}
                              </div>

                              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                                <span className="text-sm font-bold text-black">
                                  {phase.phase_order}
                                </span>
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-lg font-bold text-white mb-1 truncate">
                                  {phase.title}
                                </h3>
                                <p className="text-sm text-zinc-500 line-clamp-1">
                                  {phase.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6 flex-wrap">
                              <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                  {phaseProgress}%
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase">
                                  Progress
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                  {visiblePhaseTasks}
                                  {visiblePhaseTasks !== totalPhaseTasks && (
                                    <span className="text-zinc-500">
                                      /{totalPhaseTasks}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase">
                                  Tasks
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-bold text-white">
                                  {Math.round(totalMinutes / 60)}h
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500 uppercase">
                                  Duration
                                </div>
                              </div>
                             
                            </div>
                          </div>

                          <div className="mt-4 h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-white rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${phaseProgress}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                          </div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className="border-t border-zinc-900 bg-zinc-950/30"
                            >
                              <div className="p-5 space-y-3">
                                {phase.tasks.length === 0 ? (
                                  <div className="text-center py-8 text-zinc-500">
                                    No tasks match the current filters
                                  </div>
                                ) : (
                                  phase.tasks.map((task) => (
                                    <motion.div
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, x: -15 }}
                                      transition={{
                                        type: "spring",
                                        stiffness: 420,
                                        damping: 28,
                                      }}
                                      className={`flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl border transition-all ${
                                        task.completed
                                          ? "bg-zinc-900/30 border-zinc-800/60"
                                          : "bg-zinc-900/60 border-zinc-800"
                                      }`}
                                    >
                                      <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0">
                                          {task.completed ? (
                                            <div className="h-6 w-6 rounded-lg border-2 bg-white border-white flex items-center justify-center">
                                              <CheckCircle2
                                                className="h-4 w-4 text-black"
                                                strokeWidth={3}
                                              />
                                            </div>
                                          ) : (
                                            <div className="h-6 w-6 rounded-lg border-2 border-zinc-700" />
                                          )}
                                        </div>

                                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                                          <span className="text-xs font-bold text-zinc-300">
                                            {task.task_order}
                                          </span>
                                        </div>

                                        <div className="min-w-0">
                                          <h4
                                            className={`font-semibold mb-1 ${
                                              task.completed
                                                ? "text-zinc-500 line-through"
                                                : "text-white"
                                            }`}
                                          >
                                            {task.title}
                                          </h4>
                                          <p className="text-xs text-zinc-500 line-clamp-2">
                                            {task.description}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-4 flex-wrap justify-end">
                                        <div
                                          className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${getDifficultyColor(
                                            task.difficulty,
                                          )}`}
                                        >
                                          {task.difficulty}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono">
                                          <Clock
                                            className="h-4 w-4"
                                            strokeWidth={2}
                                          />
                                          <span>
                                            {task.estimated_minutes} min
                                          </span>
                                        </div>
                                        {task.progress_minutes > 0 && (
                                          <div className="text-xs font-mono text-zinc-500">
                                            {task.progress_minutes}/
                                            {task.estimated_minutes} min
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  ))
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
