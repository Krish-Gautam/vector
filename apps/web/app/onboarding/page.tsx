"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import api from "../lib/api";

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    goal: "",
    currentLevel: "",
    duration: "",
    dailyHours: "",
    targetCompany: "",
  });

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await api.post("/api/roadmap/generate", form);

      router.replace("/roadmap");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-10 h-[360px] w-[360px] rounded-full bg-white/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="grid w-full gap-10 lg:grid-cols-[1.05fr_1fr]"
        >
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/70">
              <Sparkles className="h-4 w-4" />
              Personalized Onboarding
            </div>

            <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
              Build a roadmap that feels deliberate and achievable.
            </h1>

            <p className="text-lg text-white/70">
              Share your goal, timeline, and daily availability. We will craft a focused plan with AI guidance and clear milestones.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Goal clarity and milestones",
                "Adaptive pacing suggestions",
                "Weekly checkpoints",
                "Progress signals",
              ].map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="w-full rounded-[32px] border border-white/10 bg-zinc-950/90 p-8 shadow-[0_35px_120px_rgba(0,0,0,0.7)] backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Build Your AI Roadmap</h2>
                <p className="text-sm text-white/60">Tell the AI your target and current level</p>
              </div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <input
                placeholder="Goal (FAANG, DSA, ML, etc)"
                className="rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:bg-black"
                value={form.goal}
                onChange={(e) =>
                  setForm({
                    ...form,
                    goal: e.target.value,
                  })
                }
              />

              <select
                className="rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:bg-black"
                value={form.currentLevel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentLevel: e.target.value,
                  })
                }
              >
                <option value="">Current Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <input
                placeholder="Duration (6 months)"
                className="rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:bg-black"
                value={form.duration}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: e.target.value,
                  })
                }
              />

              <input
                placeholder="Daily Study Hours"
                className="rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:bg-black"
                value={form.dailyHours}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dailyHours: e.target.value,
                  })
                }
              />

              <input
                placeholder="Target Company"
                className="rounded-2xl border border-white/10 bg-black/60 px-4 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:bg-black md:col-span-2"
                value={form.targetCompany}
                onChange={(e) =>
                  setForm({
                    ...form,
                    targetCompany: e.target.value,
                  })
                }
              />
            </div>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-4 text-sm font-semibold text-black transition hover:bg-zinc-200"
            >
              {loading ? "Generating AI Roadmap..." : "Generate Roadmap"}

              <ArrowRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}