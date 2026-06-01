"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

const phases = [
  "Foundation",
  "Core Skills",
  "Projects",
  "Advanced",
  "Portfolio",
  "Interview Prep",
  "Career Growth",
];

const data = {
  Foundation: [
    {
      title: "Learn Programming Fundamentals",
      status: "Completed",
      category: "Learning",
      time: "Week 1",
    },
    {
      title: "Understand Problem Solving Basics",
      status: "In Progress",
      category: "Practice",
      time: "Week 2",
    },
    {
      title: "Complete Beginner Exercises",
      status: "Pending",
      category: "Tasks",
      time: "Week 3",
    },
  ],

  "Core Skills": [
    {
      title: "Master JavaScript & React",
      status: "Completed",
      category: "Learning",
      time: "Week 4",
    },
    {
      title: "Build Small Applications",
      status: "In Progress",
      category: "Project",
      time: "Week 5",
    },
    {
      title: "Practice Real-World Scenarios",
      status: "Pending",
      category: "Practice",
      time: "Week 6",
    },
  ],

  Projects: [
    {
      title: "Create Portfolio Website",
      status: "Completed",
      category: "Project",
      time: "Week 7",
    },
    {
      title: "Build Full Stack Application",
      status: "In Progress",
      category: "Project",
      time: "Week 8",
    },
    {
      title: "Deploy Production Project",
      status: "Pending",
      category: "Milestone",
      time: "Week 9",
    },
  ],

  Advanced: [
    {
      title: "System Design Fundamentals",
      status: "Completed",
      category: "Learning",
      time: "Week 10",
    },
    {
      title: "Scalable Architecture Concepts",
      status: "In Progress",
      category: "Assessment",
      time: "Week 11",
    },
    {
      title: "Advanced Optimization Techniques",
      status: "Pending",
      category: "Learning",
      time: "Week 12",
    },
  ],

  Portfolio: [
    {
      title: "Showcase Best Projects",
      status: "Completed",
      category: "Project",
      time: "Week 13",
    },
    {
      title: "Optimize Resume & Profiles",
      status: "In Progress",
      category: "Milestone",
      time: "Week 14",
    },
    {
      title: "Prepare Personal Branding",
      status: "Pending",
      category: "Tasks",
      time: "Week 15",
    },
  ],

  "Interview Prep": [
    {
      title: "Mock Interviews",
      status: "Completed",
      category: "Assessment",
      time: "Week 16",
    },
    {
      title: "Behavioral Question Practice",
      status: "In Progress",
      category: "Practice",
      time: "Week 17",
    },
    {
      title: "Final Readiness Evaluation",
      status: "Pending",
      category: "Milestone",
      time: "Week 18",
    },
  ],

  "Career Growth": [
    {
      title: "Set Long-Term Goals",
      status: "Completed",
      category: "Milestone",
      time: "Month 1",
    },
    {
      title: "Expand Professional Network",
      status: "In Progress",
      category: "Tasks",
      time: "Month 2",
    },
    {
      title: "Continuous Skill Development",
      status: "Pending",
      category: "Learning",
      time: "Month 3",
    },
  ],
};

export default function RoadmapGen() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((p) => (p + 1) % phases.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [active]);

 const phase = phases[active];
const roadmapTasks = data[phase as keyof typeof data];

  return (
    <div className="border-b md:border-r border-zinc-500 p-6 sm:p-10 md:p-14 min-h-[700px] bg-black">
      <h3 className="text-white text-4xl font-bold uppercase mb-5 tracking-tight">
        AI-POWERED ROADMAP GENERATION
      </h3>

      <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px]">
        Create a personalized roadmap tailored to your goal, current skill
        level, available time, and daily study capacity.
      </p>

      <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px] mt-8">
        Whether you're learning coding, preparing for interviews, mastering a
        skill, or building a business, get a step-by-step plan designed
        specifically for you.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 rounded-[28px] border border-zinc-800 overflow-hidden bg-[#050505]"
      >
        <div className="p-3 flex gap-1 flex-wrap border-b border-zinc-800">
          {phases.map((item, i) => (
            <button
              key={item}
              onClick={() => setActive(i)}
              className="relative px-2 py-2 rounded-full text-sm font-light"
            >
              {active === i && (
                <motion.div
                  layoutId="activeCompany"
                  className="absolute inset-0 bg-[#4f8cff] rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 250,
                    damping: 25,
                  }}
                />
              )}

              <span
                className={`relative z-10 ${
                  active === i ? "text-white" : "text-zinc-400"
                }`}
              >
                {item}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -25,
            }}
            transition={{
              duration: 0.35,
            }}
            className="p-6 space-y-4 min-h-[320px]"
          >
            {roadmapTasks.map((task, index) => (
              <motion.div
                key={task.title}
                initial={{
                  opacity: 0,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                className="flex flex-wrap items-center gap-3 border-b border-zinc-900 pb-4"
              >
                <div className="size-7 rounded-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-500">
                  {index + 1}
                </div>

                <div className="text-white flex-1">{task.title}</div>

                <div className="flex items-center gap-1 text-zinc-400 text-sm">
                  <Clock3 size={14} />
                  {task.time}
                </div>

                <div className={`px-3 py-1 rounded-full border text-xs ${
                  task.status === "Completed"
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5"
                    : task.status === "In Progress"
                    ? "border-orange-500/50 text-orange-400 bg-orange-500/5"
                    : "border-zinc-700 text-zinc-400 bg-zinc-900/50"
                }`}>
                  {task.status}
                </div>

                <div className="px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 text-xs">
                  {task.category}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
