"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Users,
  Star,
  MessageSquare,
  Trophy,
} from "lucide-react";

const organizations = [
  {
    name: "Full Stack Developer Cohort",
    members: "245",
    rating: 5,
    topic:
      "Building production-ready full stack projects and helping members stay accountable.",
    activeToday: "67",
    completion: "82%",
    achievement:
      "Top members completed this phase 2 weeks ahead of schedule.",
  },
  {
    name: "AI Engineer Community",
    members: "180",
    rating: 5,
    topic:
      "Machine learning roadmaps, project reviews and AI career discussions.",
    activeToday: "51",
    completion: "78%",
    achievement:
      "83% of members maintained their learning streak this week.",
  },
  {
    name: "DSA Mastery Group",
    members: "320",
    rating: 4,
    topic:
      "Daily coding challenges, problem-solving discussions and progress sharing.",
    activeToday: "96",
    completion: "85%",
    achievement:
      "Members solved over 1200 problems this month.",
  },
  {
    name: "Startup Builders Hub",
    members: "140",
    rating: 5,
    topic:
      "Launching products, validating ideas and growing startups together.",
    activeToday: "42",
    completion: "74%",
    achievement:
      "Several members successfully launched their MVP this month.",
  },
];

export default function CommunityHub() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % organizations.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const org = organizations[active];

  return (
    <div className="relative overflow-hidden border-t  border-zinc-400  min-h-[700px] p-6 sm:p-10 md:p-14 bg-black">
      <h3 className="text-white text-4xl font-bold uppercase mb-5">
        LEARN WITH YOUR COMMUNITY
      </h3>

      <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px]">
        Join organizations filled with people pursuing similar goals.
      </p>

      <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px] mt-8">
        Share progress, stay accountable, discuss challenges and grow together.
      </p>

      <div className="relative mt-20 h-[430px] flex items-center justify-center">
        {/* GLOW */}
        <motion.div
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
          className="
            absolute
            size-[300px]
            rounded-full
            bg-[#4f8cff]/20
            blur-[120px]
          "
        />

        {/* FLOATING WINDOW */}
        <motion.div
          animate={{
            y: [-12, 12, -12],
            rotate: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            relative
            w-full
            max-w-[430px]
            rounded-[30px]
            border
            border-zinc-800
            bg-[#070707]
            overflow-hidden
            shadow-[0_0_80px_rgba(79,140,255,0.2)]
          "
        >
          {/* HEADER */}
          <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-800">
            <div className="size-3 rounded-full bg-red-500" />
            <div className="size-3 rounded-full bg-yellow-500" />
            <div className="size-3 rounded-full bg-green-500" />

            <span className="ml-3 text-zinc-500 text-sm">
              Community Hub
            </span>
          </div>

          {/* CONTENT */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -30,
              }}
              transition={{
                duration: 0.4,
              }}
              className="p-6"
            >
              {/* ORGANIZATION */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="
                    size-12
                    rounded-xl
                    bg-[#4f8cff]/10
                    flex
                    items-center
                    justify-center
                  "
                  >
                    <Users
                      size={24}
                      className="text-[#7fb8ff]"
                    />
                  </div>

                  <div>
                    <h4 className="text-white text-lg font-bold">
                      {org.name}
                    </h4>

                    <p className="text-zinc-400 text-sm">
                      {org.members} Active Members
                    </p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {[...Array(org.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="#7fb8ff"
                      className="text-[#7fb8ff]"
                    />
                  ))}
                </div>
              </div>

              {/* TOPIC */}
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="
                  mt-8
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  p-5
                "
              >
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare
                    size={18}
                    className="text-[#7fb8ff]"
                  />

                  <span className="text-zinc-400 text-sm">
                    Most Discussed Topic
                  </span>
                </div>

                <p className="text-white leading-relaxed">
                  {org.topic}
                </p>
              </motion.div>

              {/* STATS */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div
                  className="
                  rounded-xl
                  border
                  border-zinc-800
                  p-4
                  text-center
                "
                >
                  <p className="text-zinc-500 text-xs">
                    Members
                  </p>

                  <p className="text-white font-bold mt-1">
                    {org.members}
                  </p>
                </div>

                <div
                  className="
                  rounded-xl
                  border
                  border-zinc-800
                  p-4
                  text-center
                "
                >
                  <p className="text-zinc-500 text-xs">
                    Active Today
                  </p>

                  <p className="text-[#7fb8ff] font-bold mt-1">
                    {org.activeToday}
                  </p>
                </div>

                <div
                  className="
                  rounded-xl
                  border
                  border-zinc-800
                  p-4
                  text-center
                "
                >
                  <p className="text-zinc-500 text-xs">
                    Completion
                  </p>

                  <p className="text-[#9cc4ff] font-bold mt-1">
                    {org.completion}
                  </p>
                </div>
              </div>

              {/* ACHIEVEMENT */}
              <motion.div
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                }}
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-[#7fb8ff]/30
                  bg-[#7fb8ff]/5
                  p-4
                  flex
                  items-center
                  gap-3
                "
              >
                <Trophy
                  size={22}
                  className="text-[#7fb8ff]"
                />

                <span className="text-zinc-300">
                  {org.achievement}
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* FLOATING DECORATIONS */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
          }}
          transition={{
            repeat: Infinity,
            duration: 5,
          }}
          className="
            absolute
            right-12
            top-0
            size-20
            rounded-full
            border
            border-[#7fb8ff]/30
          "
        />

        <motion.div
          animate={{
            y: [20, -20, 20],
          }}
          transition={{
            repeat: Infinity,
            duration: 7,
          }}
          className="
            absolute
            left-8
            bottom-0
            size-14
            rounded-full
            border
            border-zinc-700
          "
        />
      </div>
    </div>
  );
}