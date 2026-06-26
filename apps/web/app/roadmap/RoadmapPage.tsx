"use client";
import { useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import RoadmapSkeleton from "./RoadmapSkeleton";
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
interface RoadmapPageProps {
  roadmapData: RoadmapData;
  embedded?: boolean;
  onOpenMobile?: () => void;
}

export default function RoadmapPage({
  roadmapData: initialData,
  embedded = false,
  onOpenMobile,
}: RoadmapPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(
    initialData,
  );
  const [loading, setLoading] = useState(false); // No longer loading by default
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<
    "ALL" | "EASY" | "MEDIUM" | "HARD"
  >("ALL");
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);

  const difficulties = [
    { label: "All", value: "ALL" },
    { label: "Easy", value: "EASY" },
    { label: "Medium", value: "MEDIUM" },
    { label: "Hard", value: "HARD" },
  ];

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
          const matchesCompletion = !task.completed;
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
  }, [difficultyFilter, phases, searchQuery]);

  const openMobileSidebar = () => {
    if (embedded && onOpenMobile) {
      onOpenMobile();
      return;
    }
    setMobileOpen(true);
  };

  const handleExpandAll = () => {
    const phaseIds = new Set(phases.map((phase) => phase.id));
    setExpandedPhases((prev) =>
      prev.size === phaseIds.size ? new Set() : phaseIds,
    );
  };

  const renderContent = () => {
    if (loading) {
      return <RoadmapSkeleton />;
    }

    if (!roadmapData) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] text-zinc-400 font-mono text-sm">
          Failed to load roadmap. Please verify connections.
        </div>
      );
    }

    const { roadmap, goal } = roadmapData.data;
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

    return (
          <motion.div
            variants={uiVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1400px] px-4 md:px-8 py-8"
          >
            {/* HEADER */}
            <div className="mb-6 md:mb-8  pb-5 md:pb-6 border-b border-zinc-900">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                      Roadmap Console
                    </span>
                    <div className="h-1 w-1 rounded-full bg-zinc-600" />
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-lg sm:text-xl md:text-3xl font-extrabold tracking-tight text-white break-words">
                        {roadmap.title}
                      </h1>

                      <p className="text-sm text-zinc-500 mt-0.5">
                        Goal: {goal.title} • Level: {goal.currentLevel}
                      </p>
                    </div>

                    <button
                      onClick={openMobileSidebar}
                      className="xl:hidden flex-shrink-0 p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  {/* SEARCH */}
                  <div className="relative flex-1 lg:flex-none">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search phases or tasks"
                      className="w-full lg:w-[260px] rounded-xl border border-zinc-800 bg-zinc-950/40 pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
                    />
                  </div>

                  {/* FILTER + EXPAND */}
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                    {/* Custom Difficulty Dropdown */}
                    <div className="relative ">
                      <button
                        onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                        className="w-full sm:w-[170px] cursor-pointer flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-sm text-zinc-200 hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-zinc-500" />
                          <span>
                            {
                              difficulties.find(
                                (item) => item.value === difficultyFilter,
                              )?.label
                            }
                          </span>
                        </div>

                        <ChevronDown
                          className={`h-4 w-4 text-zinc-500 transition-transform ${
                            isDifficultyOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isDifficultyOpen && (
                        <div className="absolute  top-full left-0 mt-2 w-full rounded-xl border border-zinc-800 bg-[#111216] shadow-2xl overflow-hidden z-50">
                          {difficulties.map((item) => (
                            <button
                              key={item.value}
                              onClick={() => {
                                setDifficultyFilter(
                                  item.value as
                                    | "ALL"
                                    | "EASY"
                                    | "MEDIUM"
                                    | "HARD",
                                );
                                setIsDifficultyOpen(false);
                              }}
                              className={`w-full cursor-pointer px-2 py-2 text-left text-sm transition-colors ${ difficultyFilter === item.value   ? "bg-white text-black font-medium"   : "text-zinc-300 hover:bg-zinc-800" }`}>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={handleExpandAll}
                      className="px-4 cursor-pointer py-2.5 rounded-xl border border-zinc-800 bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors whitespace-nowrap"
                    >
                      {expandedPhases.size === phases.length
                        ? "Collapse"
                        : "Expand"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PROGRESS OVERVIEW */}
            <div className="mb-6">
              {/* Mobile: horizontal scroll strip */}
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:hidden">
                {[
                  {
                    icon: (
                      <Target
                        className="h-4 w-4 text-blue-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-blue-500/10",
                    value: `${overallProgress}%`,
                    label: "Progress",
                  },
                  {
                    icon: (
                      <Calendar
                        className="h-4 w-4 text-purple-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-purple-500/10",
                    value: phases.length,
                    label: "Phases",
                  },
                  {
                    icon: (
                      <CheckCircle2
                        className="h-4 w-4 text-emerald-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-emerald-500/10",
                    value: `${completedTasks}/${totalTasks}`,
                    label: "Tasks",
                  },
                  {
                    icon: (
                      <Clock
                        className="h-4 w-4 text-orange-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-orange-500/10",
                    value: `${Math.round(phases.reduce((sum, p) => sum + calculateTotalMinutes(p.tasks), 0) / 60)}h`,
                    label: "Time",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={cardVariants}
                      className="shrink-0 flex items-center gap-3 bg-[#0d0e12]/30 border border-zinc-800/70 rounded-xl px-4 py-3 min-w-32.5"
                  >
                    <div
                      className={`h-8 w-8 rounded-lg ${stat.color} flex items-center justify-center flex-shrink-0`}
                    >
                      {stat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-white leading-none">
                        {stat.value}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1 truncate">
                        {stat.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop: 4-column grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    icon: (
                      <Target
                        className="h-5 w-5 text-blue-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-blue-500/10",
                    value: `${overallProgress}%`,
                    label: "Overall Progress",
                  },
                  {
                    icon: (
                      <Calendar
                        className="h-5 w-5 text-purple-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-purple-500/10",
                    value: phases.length,
                    label: "Total Phases",
                  },
                  {
                    icon: (
                      <CheckCircle2
                        className="h-5 w-5 text-emerald-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-emerald-500/10",
                    value: `${completedTasks}/${totalTasks}`,
                    label: "Tasks Completed",
                  },
                  {
                    icon: (
                      <Clock
                        className="h-5 w-5 text-orange-500"
                        strokeWidth={2}
                      />
                    ),
                    color: "bg-orange-500/10",
                    value: `${Math.round(phases.reduce((sum, p) => sum + calculateTotalMinutes(p.tasks), 0) / 60)}h`,
                    label: "Total Time",
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={cardVariants}
                    className="bg-[#0d0e12]/30 border border-zinc-800/70 rounded-2xl p-5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}
                      >
                        {stat.icon}
                      </div>
                      <span className="text-2xl font-bold text-white">
                        {stat.value}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-zinc-500 uppercase">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
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
                        className="bg-[#0b0c10]/40 border font-(family-name:--font-inter) border-zinc-800/60 rounded-2xl overflow-hidden"
                      >
                        {/* PHASE HEADER */}
                        <button
                          onClick={() => togglePhase(phase.id)}
                          className="w-full text-left p-3 md:p-5 hover:bg-zinc-900/40 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown
                                  className="h-4 w-4 text-zinc-400"
                                  strokeWidth={2}
                                />
                              ) : (
                                <ChevronRight
                                  className="h-4 w-4 text-zinc-400"
                                  strokeWidth={2}
                                />
                              )}
                            </div>

                            <div className="flex-shrink-0 h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                              <span className="text-xs font-bold text-black">
                                {phase.phase_order}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm md:text-base font-bold text-white truncate leading-snug">
                                {phase.title}
                              </h3>
                              <p className="text-xs text-zinc-500 truncate mt-0.5">
                                {phase.description}
                              </p>
                            </div>

                            {/* STATS PILL GROUP */}
                            <div className="flex-shrink-0 flex items-center divide-x divide-zinc-800 border border-zinc-800/70 rounded-xl overflow-hidden">
                              <div className="px-2.5 py-1.5 text-center">
                                <div className="text-xs font-bold text-white leading-none">
                                  {phaseProgress}%
                                </div>
                                <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                                  Done
                                </div>
                              </div>
                              <div className="px-2.5 py-1.5 text-center">
                                <div className="text-xs font-bold text-white leading-none">
                                  {visiblePhaseTasks}
                                  {visiblePhaseTasks !== totalPhaseTasks && (
                                    <span className="text-zinc-500">
                                      /{totalPhaseTasks}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                                  Tasks
                                </div>
                              </div>
                              <div className="px-2.5 py-1.5 text-center">
                                <div className="text-xs font-bold text-white leading-none">
                                  {Math.round(totalMinutes / 60)}h
                                </div>
                                <div className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                                  Est.
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* PROGRESS BAR */}
                          <div className="mt-3 h-[3px] bg-zinc-900 rounded-full overflow-hidden">
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
                              <div className="p-3 md:p-5 space-y-2">
                                {phase.tasks.length === 0 ? (
                                  <div className="text-center py-8 text-zinc-500 text-sm">
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
                                      className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                                        task.completed
                                          ? "bg-zinc-900/30 border-zinc-800/60"
                                          : "bg-zinc-900/60 border-zinc-800"
                                      }`}
                                    >
                                      {/* CHECKBOX */}
                                      <div className="flex-shrink-0 mt-0.5">
                                        {task.completed ? (
                                          <div className="h-[22px] w-[22px] rounded-md border-2 bg-white border-white flex items-center justify-center">
                                            <CheckCircle2
                                              className="h-3.5 w-3.5 text-black"
                                              strokeWidth={3}
                                            />
                                          </div>
                                        ) : (
                                          <div className="h-[22px] w-[22px] rounded-md border-2 border-zinc-700" />
                                        )}
                                      </div>

                                      {/* ORDER NUMBER */}
                                      <div className="flex-shrink-0 mt-0.5 h-[22px] w-[22px] rounded-md bg-zinc-800 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-zinc-300">
                                          {task.task_order}
                                        </span>
                                      </div>

                                      {/* TASK CONTENT */}
                                      <div className="flex-1 min-w-0">
                                        <h4
                                          className={`text-sm font-semibold leading-snug ${
                                            task.completed
                                              ? "text-zinc-500 line-through"
                                              : "text-white"
                                          }`}
                                        >
                                          {task.title}
                                        </h4>
                                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                                          {task.description}
                                        </p>

                                        {/* META ROW */}
                                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                          <div
                                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getDifficultyColor(
                                              task.difficulty,
                                            )}`}
                                          >
                                            {task.difficulty}
                                          </div>
                                          <div className="flex items-center gap-1 text-zinc-500 text-[10px] font-mono">
                                            <Clock
                                              className="h-3 w-3"
                                              strokeWidth={2}
                                            />
                                            <span>
                                              {task.estimated_minutes} min
                                            </span>
                                          </div>
                                          {task.progress_minutes > 0 && (
                                            <div className="text-[10px] font-mono text-zinc-600">
                                              {task.progress_minutes}/
                                              {task.estimated_minutes} min
                                            </div>
                                          )}
                                        </div>
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
    );
  };

  if (embedded) {
    return renderContent();
  }

  return (
    <div className="h-screen font-(family-name:--font-inter) bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
      <div className="flex h-full">
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

        <Sidebar onNavigate={() => setMobileOpen(false)} />

        <main className="flex-1 min-w-0 bg-[#070b0a] flex flex-col">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
