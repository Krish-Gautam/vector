"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  Target,
  Activity,
  Trophy,
} from "lucide-react";

const cards = [
  {
    title: "Roadmap Progress",
    icon: TrendingUp,
    completion: 78,
    stats: {
      completed: 94,
      progress: 78,
      streak: 24,
    },
  },
  {
    title: "Daily Consistency",
    icon: Activity,
    completion: 86,
    stats: {
      completed: 128,
      progress: 86,
      streak: 31,
    },
  },
  {
    title: "Goal Achievement",
    icon: Target,
    completion: 65,
    stats: {
      completed: 72,
      progress: 65,
      streak: 18,
    },
  },
  {
    title: "Milestone Tracking",
    icon: Trophy,
    completion: 91,
    stats: {
      completed: 41,
      progress: 91,
      streak: 42,
    },
  },
];

export default function ProgressTrackingCard() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden border-b md:border-b-0 md:border-r border-zinc-500 min-h-[700px] p-6 sm:p-10 md:p-14 bg-black">
      <h3 className="text-white text-4xl font-bold uppercase mb-5 tracking-tight">
        TRACK YOUR PROGRESS
      </h3>

      <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px]">
        Monitor every milestone, completed task, learning streak, and phase
        completion from a single dashboard.
      </p>

      <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px] mt-8">
        AI continuously analyzes your progress and helps keep you on track
        toward your goals.
      </p>

      <div className="relative h-[420px] mt-10 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          className="absolute size-[260px] rounded-full bg-[#4f8cff]/20 blur-[100px]"
        />

        {cards.map((card, index) => {
          const Icon = card.icon;

          const offset = (index - active + cards.length) % cards.length;

          const scale = offset === 0 ? 1 : offset === 1 ? 0.92 : 0.84;

          const y = offset === 0 ? 0 : offset === 1 ? 35 : 70;

          const opacity = offset === 0 ? 1 : offset === 1 ? 0.7 : 0.4;

          return (
            <motion.div
              key={card.title}
              animate={{
                scale,
                y,
                opacity,
              }}
              transition={{
                duration: 0.5,
              }}
              whileHover={{
                y: y - 10,
              }}
              className="
                absolute
                w-full
                max-w-[420px]
                rounded-[32px]
                border
                border-zinc-800
                bg-[#070707]
                p-8
                shadow-2xl
              "
              style={{
                zIndex: 10 - offset,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-2xl font-bold text-white">
                    {card.title}
                  </h4>

                  <p className="mt-2 text-zinc-400">
                    AI Progress Analytics
                  </p>
                </div>

                <div className="size-14 rounded-2xl bg-zinc-900 flex items-center justify-center">
                  <Icon size={28} className="text-[#7fb8ff]" />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Overall Completion</span>
                  <span>{card.completion}%</span>
                </div>

                <div className="mt-3 h-3 rounded-full bg-zinc-900 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${card.completion}%`,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    className="h-full bg-[#4f8cff]"
                  />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
                  <p className="text-zinc-500 text-xs">
                    Tasks Done
                  </p>

                  <p className="text-white font-semibold mt-1">
                    {card.stats.completed}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
                  <p className="text-zinc-500 text-xs">
                    Progress
                  </p>

                  <p className="text-[#7fb8ff] font-semibold mt-1">
                    {card.stats.progress}%
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
                  <p className="text-zinc-500 text-xs">
                    Streak
                  </p>

                  <p className="text-[#9cc4ff] font-semibold mt-1">
                    {card.stats.streak}d
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute bottom-[-40px] flex gap-2">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                active === i
                  ? "w-10 bg-[#4f8cff]"
                  : "w-2 bg-zinc-700 hover:bg-zinc-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}