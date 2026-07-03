"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Target,
  TrendingUp,
  CalendarDays,
  Building2,
  ArrowRight,
  Compass,
  Check,
  Sparkles,
  ShieldCheck,
  Rocket,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";

const GOAL_OPTIONS = [
  "DSA",
  "Full Stack Development",
  "Machine Learning",
  "Data Science",
  "Competitive Programming",
  "Cyber Security",
  "DevOps",
  "Custom",
];

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const DURATION_OPTIONS = [
  { value: "1", label: "1 month" },
  { value: "2", label: "2 months" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "9", label: "9 months" },
  { value: "12", label: "12 months" },
];

const HOURS_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} hour${i > 0 ? "s" : ""}`,
}));

const BENEFITS = [
  {
    icon: Target,
    title: "Clear destination",
    text: "Tell us what you want to build toward.",
  },
  {
    icon: ShieldCheck,
    title: "Realistic pacing",
    text: "Set a daily rhythm that fits your life.",
  },
  {
    icon: Sparkles,
    title: "Actionable structure",
    text: "Get milestones, tasks, and weekly focus.",
  },
];

/* ---------------------------------------------------------------- */
/*  Custom dropdown — replaces the native <select>                  */
/* ---------------------------------------------------------------- */

type Option = { value: string; label: string };

function Dropdown({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full no-scrollbar items-center justify-between rounded-xl border px-4 py-3 text-left text-sm outline-none transition-all duration-200 ${
          open
            ? "border-white bg-white/6 ring-1 ring-white/30"
            : "border-white/15 bg-white/2 hover:border-white/35 hover:bg-white/4"
        }`}
      >
        <span className={selected ? "text-white" : "text-white/38"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute no-scrollbar z-30 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-white/15 bg-[#0a0a0a] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-white text-black"
                        : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {opt.label}
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- */

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submitLock = useRef(false);

  const [form, setForm] = useState({
    goal: "",
    customGoal: "",
    currentLevel: "",
    duration: "",
    dailyHours: "",
    targetCompany: "",
  });

  useEffect(() => {
    router.prefetch("/generating");

    const checkRoadmapStatus = async () => {
      try {
        const { data } = await api.get("/api/profile/status");
        console.log("Roadmap status:", data.roadmap_status);

        switch (data.roadmap_status) {
          case "ready":
            router.replace("/roadmap");
            break;

          case "generating":
            router.replace("/generating");
            break;

          default:
            break;
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkRoadmapStatus();
  }, [router]);

  const handleSubmit = () => {
    if (submitLock.current) return;

    setError("");

    const goal = form.goal === "Custom" ? form.customGoal.trim() : form.goal;

    if (!goal || !form.currentLevel || !form.duration || !form.dailyHours) {
      setError("Please fill all required fields.");
      return;
    }

    submitLock.current = true;
    setLoading(true);

    void api
      .post("/api/roadmap/generate", {
        ...form,
        goal,
        duration: Number(form.duration),
        dailyHours: Number(form.dailyHours),
      })
      .catch((err: any) => {
        console.error(err);
        setError("Failed to generate roadmap.");
        submitLock.current = false;
        setLoading(false);
      });

    router.replace("/generating");
  };

  // Waypoint completion state — drives the route line down the form
  const goalFilled =
    form.goal === "Custom" ? !!form.customGoal.trim() : !!form.goal;
  const levelFilled = !!form.currentLevel;
  const durationFilled = !!form.duration;
  const hoursFilled = !!form.dailyHours;
  const companyFilled = !!form.targetCompany;

  const requiredTotal = 4;
  const requiredDone = [
    goalFilled,
    levelFilled,
    durationFilled,
    hoursFilled,
  ].filter(Boolean).length;
  const completionPct = Math.round((requiredDone / requiredTotal) * 100);

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/[0.02] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white focus:bg-white/[0.06] focus:ring-1 focus:ring-white/30";

  const goalOptions: Option[] = GOAL_OPTIONS.map((g) => ({
    value: g,
    label: g === "Custom" ? "Custom goal" : g,
  }));

  return (
    <div className="relative min-h-full font-(family-name:--font-inter) overflow-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-full max-w-7xl items-center px-6 pt-14 pb-9 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid w-full gap-10 lg:grid-cols-[1fr_1.1fr]"
        >
          <div className="flex flex-col justify-center gap-8 lg:pr-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
              <Compass className="h-3.5 w-3.5" />
              Roadmap setup
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
                Build a roadmap that feels like part of your product.
              </h1>

              <p className="max-w-lg text-base leading-relaxed text-white/60 md:text-lg">
                Tell Vector what you are aiming for, where you are starting, and
                how much time you can give it each day. We will turn that into a
                clean, realistic plan.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {BENEFITS.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/80">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="w-full rounded-4xl border border-white/10 bg-[#0a0a0a]/92 p-6 shadow-[0_35px_120px_rgba(0,0,0,0.65)] backdrop-blur md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
                  <Rocket className="h-3.5 w-3.5" />
                  Build roadmap
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                  Set the inputs once.
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-white/50">
                  We will shape the roadmap around your pace, timeline, and
                  target outcome.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right">
                <div className="font-mono text-xs text-white/60">
                  {requiredDone}/{requiredTotal} complete
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {completionPct}%
                </div>
              </div>
            </div>

            <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full rounded-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white">
                {error}
              </div>
            )}

            <fieldset disabled={loading} className="mt-7 flex flex-col">
              {/* Waypoint 1 — Goal */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Marker done={goalFilled} icon={Target} />
                  <Line />
                </div>
                <div className="w-full pb-6">
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Destination
                  </label>
                  <Dropdown
                    value={form.goal}
                    onChange={(val) => setForm({ ...form, goal: val })}
                    options={goalOptions}
                    placeholder="Select a goal"
                  />
                  {form.goal === "Custom" && (
                    <input
                      placeholder="Describe your goal"
                      className={`${inputClass} mt-3`}
                      value={form.customGoal}
                      onChange={(e) =>
                        setForm({ ...form, customGoal: e.target.value })
                      }
                    />
                  )}
                </div>
              </div>

              {/* Waypoint 2 — Current level */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Marker done={levelFilled} icon={TrendingUp} />
                  <Line />
                </div>
                <div className="w-full pb-6">
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Starting point
                  </label>
                  <Dropdown
                    value={form.currentLevel}
                    onChange={(val) => setForm({ ...form, currentLevel: val })}
                    options={LEVEL_OPTIONS}
                    placeholder="Current level"
                  />
                </div>
              </div>

              {/* Waypoint 3 — Duration + daily hours */}
              <div className="flex gap-4 ">
                <div className="flex flex-col items-center">
                  <Marker
                    done={durationFilled && hoursFilled}
                    icon={CalendarDays}
                  />
                  <Line />
                </div>
                <div className="grid no-scrollbar w-full grid-cols-2 gap-3 pb-6">
                  <div>
                    <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Duration
                    </label>
                    <Dropdown
                      value={form.duration}
                      onChange={(val) => setForm({ ...form, duration: val })}
                      options={DURATION_OPTIONS}
                      placeholder="Length"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                      Daily pace
                    </label>
                    <Dropdown
                      value={form.dailyHours}
                      onChange={(val) => setForm({ ...form, dailyHours: val })}
                      options={HOURS_OPTIONS}
                      placeholder="Hours / day"
                    />
                  </div>
                </div>
              </div>

              {/* Waypoint 4 — Target company (optional) */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Marker done={companyFilled} icon={Building2} optional />
                </div>
                <div className="w-full">
                  <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.14em] text-white/40">
                    Target company{" "}
                    <span className="text-white/25">(optional)</span>
                  </label>
                  <input
                    placeholder="e.g. Google, Amazon..."
                    className={inputClass}
                    value={form.targetCompany}
                    onChange={(e) =>
                      setForm({ ...form, targetCompany: e.target.value })
                    }
                  />
                </div>
              </div>
            </fieldset>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading || submitLock.current}
              className="mt-8 cursor-pointer flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-white/85 disabled:opacity-60"
            >
              {loading ? "Building your roadmap..." : "Generate roadmap"}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function Marker({
  done,
  icon: Icon,
  optional,
}: {
  done: boolean;
  icon: React.ElementType;
  optional?: boolean;
}) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
        done
          ? "border-white/60 bg-white/15 text-white"
          : optional
            ? "border-dashed border-white/15 text-white/35"
            : "border-white/10 bg-white/3 text-white/35"
      }`}
    >
      {done ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Icon className="h-3.5 w-3.5" />
      )}
    </div>
  );
}

function Line() {
  return (
    <div className="my-1 h-full min-h-6 w-px border-l border-dashed border-white/10" />
  );
}
