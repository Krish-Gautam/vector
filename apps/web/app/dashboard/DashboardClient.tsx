"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import api from "../lib/api";
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Zap,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  ArrowUpRight,
  Eye,
  EyeOff,
  Loader2,
  Menu,
  Activity,
  Award,
  CalendarRange,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";

interface DashboardTask {
  id: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;
  scheduledFor?: string;
}

interface DashboardData {
  success: boolean;

  data: {
    profile: {
      username: string;
    };

    roadmap: {
      title: string;
      progress: number;
    };

    analytics: {
      completionRate: number;
      executionGrade: string;
      totalTasks: number;
      completedTasks: number;
    };

    streak: {
      current: number;
    };

    tasks: {
      today: DashboardTask[];
      weekly: DashboardTask[];
    };

    ai: {
      predictions: unknown;
      recovery: unknown;
    };

    metrics: unknown;
  };
}

export default function DashboardClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [generatingWeekly, setGeneratingWeekly] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [weeklyPlanMessage, setWeeklyPlanMessage] = useState<string | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [greeting, setGreeting] = useState("Welcome back");

  // Dynamic time-based greeting
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting("Good morning");
    else if (hr < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/api/dashboard");
        console.log("Dashboard data:", response.data);
        setDashboard(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const data = dashboard?.data;

  const completedToday = useMemo(() => {
    if (!data) return 0;
    return data.tasks.today.filter((task) => task.completed).length;
  }, [data]);

  const handleGenerateWeeklyPlan = async () => {
    if (generatingWeekly) return;

    setGeneratingWeekly(true);
    setWeeklyPlanMessage(null);
    try {
      if (data?.tasks.weekly.length) {
        const result = await api.post("/api/dailytask/generate-next-week");
        const skipped =
          typeof result?.data === "object" && result?.data
            ? (result.data as { data?: { skipped?: boolean; reason?: string } }).data?.skipped
            : false;
        if (skipped) {
          const reason =
            (result.data as { data?: { reason?: string } }).data?.reason ||
            "First complete pending tasks.";
          setWeeklyPlanMessage(reason);
        }
      } else {
        await api.post("/api/dailytask/ensure-weekly-plan");
      }
      const response = await api.get("/api/dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to generate weekly plan:", error);
      const fallback = "Unable to generate next week yet. Finish more tasks first.";
      const message =
        typeof error === "object" && error && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
      setWeeklyPlanMessage(message || fallback);
    } finally {
      setGeneratingWeekly(false);
    }
  };

  const handleTaskComplete = async (task: DashboardTask) => {
    if (!dashboard || !data || task.completed || updatingTaskId) return;

    setUpdatingTaskId(task.id);

    try {
      await api.post(`/api/dailytask/${task.id}/complete`);

      setDashboard((prev) => {
        if (!prev) return prev;

        const updateList = (items: DashboardTask[]) =>
          items.map((item) =>
            item.id === task.id ? { ...item, completed: true } : item,
          );

        return {
          ...prev,
          data: {
            ...prev.data,
            tasks: {
              ...prev.data.tasks,
              today: updateList(prev.data.tasks.today),
              weekly: updateList(prev.data.tasks.weekly),
            },
          },
        };
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const todayKey = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toLocaleDateString("en-CA");
  }, []);

  useEffect(() => {
    if (!data || selectedDay) return;
    setSelectedDay(todayKey);
  }, [data, selectedDay, todayKey]);

  const weeklyTasksByDate = useMemo(() => {
    if (!data) return new Map<string, DashboardTask[]>();

    const tasksByDate = new Map<string, DashboardTask[]>();
    data.tasks.weekly.forEach((task) => {
      const dateKey = task.scheduledFor || "";
      if (!dateKey) return;
      if (!tasksByDate.has(dateKey)) {
        tasksByDate.set(dateKey, []);
      }
      tasksByDate.get(dateKey)?.push(task);
    });

    return tasksByDate;
  }, [data]);

  const weekDays = useMemo(() => {
    if (!data) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() + idx);
      const dateKey = date.toLocaleDateString("en-CA");
      const dayTasks = weeklyTasksByDate.get(dateKey) || [];
      const hasTask = dayTasks.length > 0;
      const allCompleted = hasTask && dayTasks.every((t) => t.completed);
      const isToday = dateKey === todayKey;

      return {
        key: dateKey,
        label: date.toLocaleDateString("en-US", { weekday: "short" }),
        longLabel: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        isToday,
        hasTask,
        completed: allCompleted,
        taskCount: dayTasks.length,
        completedCount: dayTasks.filter((t) => t.completed).length,
      };
    });
  }, [data, weeklyTasksByDate, todayKey]);

  const selectedDayMeta = useMemo(
    () => weekDays.find((day) => day.key === selectedDay) || null,
    [weekDays, selectedDay],
  );

  const selectedTasks = useMemo(() => {
    if (!selectedDay) return [];
    return weeklyTasksByDate.get(selectedDay) || [];
  }, [weeklyTasksByDate, selectedDay]);

  const filteredTasks = useMemo(() => {
    if (hideCompleted) {
      return selectedTasks.filter((task) => !task.completed);
    }
    return selectedTasks;
  }, [selectedTasks, hideCompleted]);

  // Framer Motion Animation Variants with const assertion to fix TS type-inference error
  const dashboardVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 260, damping: 24 },
    },
  } as const;

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
            Restoring workspace state...
          </span>
        </div>
      </div>
    );
  }

  if (!dashboard || !data) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Failed to load dashboard. Please verify connections.
      </div>
    );
  }

  // Helper variables for radial gauge in Completion Rate card
  const radialRadius = 22;
  const radialCircumference = 2 * Math.PI * radialRadius;
  const radialOffset =
    radialCircumference - (data.analytics.completionRate / 100) * radialCircumference;

  // Grade tagging helper
  const gradeMeta = (() => {
    const grade = data.analytics.executionGrade;
    switch (grade) {
      case "S":
      case "S+":
        return {
          label: "Legendary Focus",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        };
      case "A":
      case "A+":
        return {
          label: "Optimal Momentum",
          color: "text-zinc-200 bg-zinc-800/60 border-zinc-700/60",
        };
      case "B":
      case "B+":
        return {
          label: "Consistent Output",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        };
      case "C":
        return {
          label: "Steady Pace",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        };
      default:
        return {
          label: "Base Level",
          color: "text-zinc-500 bg-zinc-900/30 border-zinc-800/30",
        };
    }
  })();

  return (
    <div className="min-h-screen bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
      <div className="flex">
        {/* MOBILE SIDEBAR MOBILE WRAPPER */}
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
            variants={dashboardVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1400px] mx-auto px-4 md:px-8 py-8"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-zinc-900">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                    Execution OS
                  </span>
                  <div className="h-1 w-1 rounded-full bg-zinc-600" />
                  <span className="text-[10px] font-bold font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  {greeting}, {data.profile.username}
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Here is your structured productivity matrix for today.
                </p>
              </div>

              {/* Mobile Header Toggle and Quick Action */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="xl:hidden p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* KPI STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* STREAK */}
              <motion.div
                variants={cardVariants}
                className="group relative bg-[#0d0e12]/30 border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                    Day Streak
                  </span>
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.5,
                      ease: "easeInOut",
                    }}
                    className="h-9 w-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500"
                  >
                    <Flame className="h-4.5 w-4.5 fill-orange-500/15" />
                  </motion.div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tracking-tight text-white">
                    {data.streak.current}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">days</span>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <Zap className="h-3 w-3 text-orange-500" />
                  <span>Next milestone: {Math.ceil((data.streak.current + 1) / 7) * 7} days</span>
                </div>
              </motion.div>

              {/* COMPLETION RATE */}
              <motion.div
                variants={cardVariants}
                className="group relative bg-[#0d0e12]/30 border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                    Completion Rate
                  </span>

                  {/* Radial Gauge */}
                  <div className="relative h-12 w-12 flex items-center justify-center">
                    <svg className="h-full w-full transform -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r={radialRadius}
                        className="stroke-zinc-900"
                        strokeWidth="3"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="24"
                        cy="24"
                        r={radialRadius}
                        className="stroke-white"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={radialCircumference}
                        initial={{ strokeDashoffset: radialCircumference }}
                        animate={{ strokeDashoffset: radialOffset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    </svg>
                    <span className="absolute text-[9px] font-bold font-mono text-zinc-400">
                      {data.analytics.completionRate}%
                    </span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono tracking-tight text-white">
                    {data.analytics.completionRate}%
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <TrendingUp className="h-3 w-3 text-zinc-400" />
                  <span>Consistency profile active</span>
                </div>
              </motion.div>

              {/* TASKS COMPLETED */}
              <motion.div
                variants={cardVariants}
                className="group relative bg-[#0d0e12]/30 border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                    Tasks Completed
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono tracking-tight text-white">
                    {data.analytics.completedTasks}
                  </span>
                  <span className="text-zinc-500 font-medium font-mono text-sm">
                    / {data.analytics.totalTasks}
                  </span>
                </div>

                {/* Inline Segmented Micro Bar */}
                <div className="flex gap-[3px] h-1 mt-4.5">
                  {Array.from({ length: Math.max(data.analytics.totalTasks, 1) }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        i < data.analytics.completedTasks ? "bg-white" : "bg-zinc-800"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>

              {/* EXECUTION GRADE */}
              <motion.div
                variants={cardVariants}
                className="group relative bg-[#0d0e12]/30 border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold font-mono tracking-wider text-zinc-500 uppercase">
                    Execution Grade
                  </span>
                  <div className="h-9 w-9 rounded-xl bg-zinc-800/40 border border-zinc-800 flex items-center justify-center text-zinc-400">
                    <Target className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]">
                    {data.analytics.executionGrade}
                  </span>
                  <span
                    className={`text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border ${gradeMeta.color}`}
                  >
                    {gradeMeta.label}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-900 flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                  <Award className="h-3 w-3 text-zinc-400" />
                  <span>Real-time grade evaluation</span>
                </div>
              </motion.div>
            </div>

            {/* MAIN DASHBOARD CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* LEFT & CENTER COLUMN - Weekly Plan timeline & Tasks */}
              <motion.div variants={cardVariants} className="lg:col-span-2 space-y-6">
                <div className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
                  {/* Timeline Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <h2 className="text-lg font-bold text-white">Weekly Calendar</h2>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Select a day to track schedules and verify completed metrics.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Hide/Show Completed Button */}
                      <button
                        onClick={() => setHideCompleted(!hideCompleted)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                      >
                        {hideCompleted ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        <span>{hideCompleted ? "Show Completed" : "Hide Completed"}</span>
                      </button>

                      {/* Generate Weekly Plan Button */}
                      <button
                        onClick={handleGenerateWeeklyPlan}
                        disabled={generatingWeekly}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all"
                      >
                        {generatingWeekly ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Building...</span>
                          </>
                        ) : data.tasks.weekly.length ? (
                          <>
                            <CalendarRange className="h-3.5 w-3.5" />
                            <span>Next Week</span>
                          </>
                        ) : (
                          <span>Create Plan</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {weeklyPlanMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 font-mono flex items-start gap-2"
                    >
                      <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{weeklyPlanMessage}</span>
                    </motion.div>
                  )}

                  {data.tasks.weekly.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-zinc-800 rounded-xl">
                      <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-zinc-400">
                        No active plan scheduled for this week.
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 max-w-[280px] mx-auto">
                        Generate a customized planner to allocate goals and tasks dynamically.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Timeline Day Slider */}
                      <LayoutGroup id="weekly-days">
                        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                          {weekDays.map((day) => {
                            const isSelected = selectedDay === day.key;
                            const progressPercent =
                              day.taskCount > 0 ? (day.completedCount / day.taskCount) * 100 : 0;

                            const ringRadius = 9;
                            const ringCircumference = 2 * Math.PI * ringRadius;
                            const ringOffset =
                              ringCircumference - (progressPercent / 100) * ringCircumference;

                            return (
                              <button
                                key={day.key}
                                onClick={() => setSelectedDay(day.key)}
                                className={`relative flex flex-col cursor-pointer items-center justify-between p-2.5 rounded-xl min-w-[76px] aspect-[5/5] border transition-all duration-300 focus:outline-none ${
                                  isSelected
                                    ? "border-transparent text-black"
                                    : day.hasTask
                                    ? "border-zinc-800/80 hover:border-zinc-700/80 bg-zinc-900/10 text-zinc-400 hover:text-white"
                                    : "border-zinc-900/60 bg-zinc-950/10 text-zinc-600 hover:text-zinc-400 hover:border-zinc-800"
                                }`}
                              >
                                {isSelected && (
                                  <motion.div
                                    layoutId="activeDayBackground"
                                    className="absolute inset-0 bg-white rounded-xl -z-10 shadow-lg shadow-white/5"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                  />
                                )}

                                <span className="text-[9px] font-bold uppercase tracking-wider">
                                  {day.label}
                                </span>

                                {/* Day status check / circle progress */}
                                <div className="my-1.5 h-6 w-6 flex items-center justify-center">
                                  {day.completed ? (
                                    <CheckCircle2
                                      className={`h-5 w-5 ${
                                        isSelected ? "text-black" : "text-emerald-400"
                                      }`}
                                      strokeWidth={2.5}
                                    />
                                  ) : day.hasTask ? (
                                    <div className="relative h-5 w-5 flex items-center justify-center">
                                      <svg className="h-full w-full transform -rotate-90">
                                        <circle
                                          cx="10"
                                          cy="10"
                                          r={ringRadius}
                                          className={
                                            isSelected ? "stroke-black/10" : "stroke-zinc-800"
                                          }
                                          strokeWidth="1.8"
                                          fill="transparent"
                                        />
                                        <circle
                                          cx="10"
                                          cy="10"
                                          r={ringRadius}
                                          className={isSelected ? "stroke-black" : "stroke-white"}
                                          strokeWidth="1.8"
                                          fill="transparent"
                                          strokeDasharray={ringCircumference}
                                          strokeDashoffset={ringOffset}
                                        />
                                      </svg>
                                      <span
                                        className={`absolute text-[8px] font-bold font-mono ${
                                          isSelected ? "text-black" : "text-zinc-400"
                                        }`}
                                      >
                                        {day.completedCount}
                                      </span>
                                    </div>
                                  ) : (
                                    <Circle
                                      className={`h-4 w-4 ${
                                        isSelected ? "text-black/30" : "text-zinc-800"
                                      }`}
                                      strokeWidth={1.5}
                                    />
                                  )}
                                </div>

                                <span className="text-xs font-bold font-mono">
                                  {day.longLabel.split(" ")[1]}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </LayoutGroup>

                      {/* Scheduled Tasks for Selected Day */}
                      <div className="border-t border-zinc-900 pt-5">
                        <div className="flex items-center justify-between mb-4.5">
                          <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>Tasks for</span>
                              <span className="text-zinc-400 font-medium">
                                {selectedDayMeta?.isToday
                                  ? "Today"
                                  : selectedDayMeta?.longLabel || "Selected Day"}
                              </span>
                            </h3>
                            <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                              {selectedTasks.filter((task) => task.completed).length} of{" "}
                              {selectedTasks.length} tasks resolved
                            </p>
                          </div>
                        </div>

                        {filteredTasks.length === 0 ? (
                          <div className="py-12 text-center border border-zinc-900/60 rounded-xl bg-zinc-950/20">
                            <CheckCircle2 className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
                            <p className="text-xs font-semibold text-zinc-500">
                              {selectedTasks.length > 0
                                ? "All tasks for this day are filtered out."
                                : "Zero goals scheduled for this weekday."}
                            </p>
                          </div>
                        ) : (
                          <LayoutGroup id="task-list">
                            <motion.div layout className="space-y-2.5">
                              <AnimatePresence mode="popLayout">
                                {filteredTasks.map((task) => (
                                  <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -15 }}
                                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                                    onClick={() => handleTaskComplete(task)}
                                    className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                                      task.completed
                                        ? "bg-zinc-900/20 border-zinc-900/50 cursor-default opacity-60"
                                        : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-[#0d0e12]/40 cursor-pointer"
                                    }`}
                                  >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                      {/* Custom Animated Checkbox */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleTaskComplete(task);
                                        }}
                                        disabled={task.completed || updatingTaskId === task.id}
                                        className={`relative h-6 w-6 rounded-lg border transition-all duration-300 flex items-center justify-center shrink-0 ${
                                          task.completed
                                            ? "bg-white border-white text-black"
                                            : "border-zinc-700 bg-zinc-950/40 hover:border-zinc-500"
                                        } ${
                                          updatingTaskId === task.id
                                            ? "cursor-wait"
                                            : task.completed
                                            ? "cursor-default"
                                            : "cursor-pointer"
                                        }`}
                                      >
                                        {updatingTaskId === task.id ? (
                                          <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                                        ) : task.completed ? (
                                          <motion.svg
                                            className="h-3.5 w-3.5 text-black"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={4.5}
                                          >
                                            <motion.path
                                              initial={{ pathLength: 0 }}
                                              animate={{ pathLength: 1 }}
                                              transition={{ duration: 0.22, ease: "easeOut" }}
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M5 13l4 4L19 7"
                                            />
                                          </motion.svg>
                                        ) : null}
                                      </button>

                                      <div className="min-w-0">
                                        <h4
                                          className={`font-semibold text-sm transition-all duration-300 ${
                                            task.completed
                                              ? "text-zinc-500 line-through"
                                              : "text-zinc-100 group-hover:text-white"
                                          }`}
                                        >
                                          {task.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-zinc-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{task.estimatedMinutes} mins</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action indicator */}
                                    <div className="flex items-center gap-2">
                                      {task.completed ? (
                                        <span className="text-[10px] font-mono text-zinc-600 bg-zinc-950/60 border border-zinc-900 px-2 py-0.5 rounded-full">
                                          Done
                                        </span>
                                      ) : (
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[10px] font-mono text-zinc-400 bg-zinc-800/40 border border-zinc-700/60 px-2 py-0.5 rounded-full">
                                          Complete task
                                        </span>
                                      )}
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </motion.div>
                          </LayoutGroup>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>

              {/* RIGHT COLUMN - Stats Details & Progress metrics */}
              <div className="space-y-6">
                {/* ROADMAP PROGRESS */}
                <motion.div
                  variants={cardVariants}
                  className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Roadmap Alignment
                    </h2>
                    <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 animate-pulse" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-zinc-500 font-medium">Focused Stream</p>
                      <h3 className="text-base font-extrabold text-white mt-1 leading-snug">
                        {data.roadmap.title}
                      </h3>
                    </div>

                    <div className="relative pt-2">
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-xs font-mono text-zinc-500">Progress metrics</span>
                        <span className="text-xl font-bold font-mono text-white">
                          {data.roadmap.progress}%
                        </span>
                      </div>

                      {/* Customized Linear Gauge */}
                      <div className="h-3 w-full bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden p-[1px] flex">
                        <motion.div
                          className="h-full bg-white rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${data.roadmap.progress}%` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-2 px-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* METRICS INDEX */}
                <motion.div
                  variants={cardVariants}
                  className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md"
                >
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                    Metrics Index
                  </h2>

                  <div className="divide-y divide-zinc-900 space-y-3.5">
                    <div className="flex items-center justify-between pb-3.5">
                      <span className="text-xs text-zinc-400 font-medium">Completed Today</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {completedToday} / {data.tasks.today.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <span className="text-xs text-zinc-400 font-medium">Weekly Accomplishments</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {data.tasks.weekly.filter((t) => t.completed).length} /{" "}
                        {data.tasks.weekly.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-3.5">
                      <span className="text-xs text-zinc-400 font-medium">Execution Streak</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {data.streak.current} days
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3.5">
                      <span className="text-xs text-zinc-400 font-medium">Accuracy Quotient</span>
                      <span className="text-sm font-bold font-mono text-white">
                        {data.analytics.completionRate}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* MOTIVATION OR PERFORMANCE TIP */}
                <motion.div
                  variants={cardVariants}
                  className="bg-[#0d0e12]/30 border border-zinc-800/60 rounded-2xl p-6"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4.5 w-4.5 text-zinc-400" />
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                      Execution Tip
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Consistent micro-actions sustain deep focus states. Maintain your streak today by
                    completing your priority tasks. You've got this.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
