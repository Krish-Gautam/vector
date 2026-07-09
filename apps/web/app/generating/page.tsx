"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Target,
  Map,
  ListChecks,
  CalendarDays,
  Users,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api";

const STEPS = [
  { label: "Understanding your goal", icon: Target },
  { label: "Planning roadmap phases", icon: Map },
  { label: "Generating learning tasks", icon: ListChecks },
  { label: "Creating weekly study plan", icon: CalendarDays },
  { label: "Matching execution circle", icon: Users },
];

// Increasing gaps = deceleration. Step N unlocks after the cumulative delay.
// Tune these to taste; last step is reached ~18s in, then holds until real "ready".
const STEP_DELAYS = [2200, 3800, 5400, 6800]; // ms between step i -> i+1

type ToastState = { type: "success" | "error"; message: string } | null;

export default function GeneratingPage() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);
  const doneRef = useRef(false);
  const activeStepRef = useRef(0); // mirrors activeStep so async code can read latest value

  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // Poll roadmap status
  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fastForwardToEnd = async (finalToast: ToastState, redirectPath: string, delay: number) => {
      // Smoothly walk through any steps we haven't visually reached yet
      for (let i = activeStepRef.current + 1; i < STEPS.length; i++) {
        await new Promise((res) => setTimeout(res, 320));
        setActiveStep(i);
      }
      await new Promise((res) => setTimeout(res, 260));
      setToast(finalToast);
      setTimeout(() => router.replace(redirectPath), delay);
    };

    const checkStatus = async () => {
      try {
        const { data } = await api.get("/api/profile/status");

        switch (data.roadmap_status) {
          case "ready":
            if (doneRef.current) return;
            doneRef.current = true;
            clearInterval(interval);

            fastForwardToEnd(
              { type: "success", message: "Roadmap generated" },
              "/roadmap",
              1600
            );
            break;

          case "failed":
            if (doneRef.current) return;
            doneRef.current = true;
            clearInterval(interval);

            fastForwardToEnd(
              { type: "error", message: "Roadmap generation failed" },
              "/onboarding",
              1800
            );
            break;

          default:
            break;
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkStatus();
    interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [router]);

  // Cosmetic step progression — staggered timeouts instead of a fixed interval,
  // so it decelerates toward the last step rather than ticking at a constant rate.
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    let cumulative = 0;

    STEP_DELAYS.forEach((delay, i) => {
      cumulative += delay;
      const t = setTimeout(() => {
        if (doneRef.current) return;
        setActiveStep((s) => Math.max(s, i + 1));
      }, cumulative);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const displayStep = Math.min(activeStep, STEPS.length - 1);
  const progressPct = Math.min(
    ((activeStep + (doneRef.current ? 1 : 0.5)) / STEPS.length) * 100,
    100
  );
  const progressLabel = doneRef.current
    ? "Finalizing roadmap"
    : STEPS[displayStep]?.label ?? "Working...";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6 text-white">
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

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-3xl overflow-hidden rounded-4xl border border-white/10 bg-[#0a0a0a]/92 p-6 text-center shadow-[0_35px_120px_rgba(0,0,0,0.65)] backdrop-blur md:p-8"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-white/5">
          <motion.div
            className="h-full bg-white"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>

        <div className="flex flex-col gap-8 text-left lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-6 md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70">
              <Compass className="h-3.5 w-3.5" />
              Plotting your route
            </div>

            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="relative mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/5"
            >
              <motion.span
                className="absolute inset-0 rounded-full border border-white/25"
                animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
              />
              <Compass className="h-10 w-10 text-white/80" />
            </motion.div>

            <h1 className="mt-8 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Building your roadmap
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-white/60">
              We are turning your goal, starting point, and daily pace into a
              structured plan with clear weekly milestones.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{progressLabel}</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  className="h-full rounded-full bg-white"
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            <p className="mt-5 text-xs leading-relaxed text-white/35">
              This usually takes 1–3 minutes.
              <br />
              Please do not close this tab.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/3 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  What happens next
                </h2>
                <p className="mt-1 text-sm text-white/55">
                  We are processing the roadmap in five steps.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-right">
                <div className="font-mono text-xs text-white/60">
                  Step {Math.min(displayStep + 1, STEPS.length)}
                </div>
                <div className="mt-1 text-sm font-semibold text-white">
                  {doneRef.current ? "Ready" : "Working"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col text-left">
              {STEPS.map((step, i) => {
                const completed = i < displayStep || doneRef.current;
                const active = i === displayStep && !doneRef.current;

                return (
                  <div key={step.label} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${
                          completed
                            ? "border-white/50 bg-white/15 text-white"
                            : active
                            ? "border-white/40 bg-white/10 text-white/90"
                            : "border-white/10 bg-white/3 text-white/35"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <step.icon className="h-3.5 w-3.5" />
                        )}
                        {active && (
                          <motion.span
                            className="absolute inset-0 rounded-full border border-white/40"
                            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                          />
                        )}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`my-1 h-7 w-px border-l ${
                            completed
                              ? "border-white/25"
                              : "border-dashed border-white/10"
                          }`}
                        />
                      )}
                    </div>
                    <div
                      className={`pb-6 pt-1.5 text-sm transition-colors ${
                        completed
                          ? "text-white"
                          : active
                          ? "text-white/90"
                          : "text-white/35"
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* completion / error toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className={`fixed bottom-8 left-1/2 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur ${
              toast.type === "success"
                ? "border-white/25 bg-[#0f0f0f]/95"
                : "border-white/25 border-dashed bg-[#0f0f0f]/95"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-white" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0 text-white/70" />
            )}
            <div className="text-left">
              <p className="text-sm font-medium text-white">{toast.message}</p>
              <p className="text-xs text-white/45">
                {toast.type === "success"
                  ? "Taking you there now..."
                  : "Sending you back to onboarding..."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}