"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";
import { Target, Lock, Trophy, MessageSquareMore, Network } from "lucide-react";

// SVG coordinate system: viewBox="0 0 640 400"
// Node centers (where orb should "arrive"):
//   Node 0 (Structured Learning):  cx=100, cy=100
//   Node 1 (Focused Practice):     cx=300, cy=100
//   Node 2 (Expert Feedback):      cx=300, cy=280
//   Node 3 (Dream Offer):          cx=520, cy=280

const NODE_DEFS = [
  { title: "Goal\nAnalysis",  icon: Network,          svgX: 100, svgY: 100, nodeIndex: 0 },
  { title: "Daily\nTasks",     icon: Lock,             svgX: 300, svgY: 100, nodeIndex: 1 },
  { title: "Progress\nTracking",      icon: MessageSquareMore,svgX: 300, svgY: 280, nodeIndex: 2 },
  { title: "Dream\nOffer",          icon: Trophy,           svgX: 520, svgY: 280, nodeIndex: 3 },
];

// Orb visits each node center in sequence
const ORB_X = [100, 300, 300, 520];
const ORB_Y = [100, 100, 280, 280];

// Duration per segment (total = ORB_DURATION)
const ORB_DURATION = 5;

// When (in seconds) the orb arrives at each node during one cycle
// Segments: 0→1 (200px horiz), 1→2 (180px vert), 2→3 (220px horiz) ≈ equal time thirds
const ARRIVE_AT = [0, ORB_DURATION * (1/3), ORB_DURATION * (2/3), ORB_DURATION - 0.05];

export default function RoadmapCard() {
  // Which nodes are "active" — orb arrival toggles them on, then resets each cycle
  const [activeNodes, setActiveNodes] = useState<Set<number>>(new Set([0]));

  useEffect(() => {
    // Activate node 0 immediately (orb starts there)
    setActiveNodes(new Set([0]));

    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = () => {
      // Reset all at the start of each cycle except node 0
      setActiveNodes(new Set([0]));

      ARRIVE_AT.forEach((t, i) => {
        if (i === 0) return; // node 0 already active
        const id = setTimeout(() => {
          setActiveNodes(prev => new Set([...prev, i]));
        }, t * 1000);
        timers.push(id);
      });
    };

    schedule();
    // Repeat every cycle
    const interval = setInterval(schedule, ORB_DURATION * 1000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative overflow-hidden border-b border-zinc-500 min-h-[700px] bg-black flex flex-col justify-between">
      {/* Subtle grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />


      <div className="relative p-6 sm:p-10 md:p-14 flex-1 flex flex-col justify-between">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-4xl font-bold uppercase mb-5 tracking-tight">
            <span className="text-white">ADAPTIVE ROADMAPS </span>
          </h3>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px]">
            Start with a roadmap built around your goals and schedule.
          </p>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-[650px] mt-4">
            As you progress, AI continuously analyzes your performance and automatically adjusts your roadmap to match your learning pace.
          </p>
        </motion.div>

        {/* Diagram wrapper — uses padding so scaled content never clips */}
        <div className="mt-12 w-full overflow-hidden">
          {/* 
            Strategy: use a fixed viewBox SVG for the diagram background/lines/orb,
            and absolutely-position nodes on top using % coordinates.
            The whole thing scales via a wrapper with aspect-ratio.
          */}
          <div
            className="relative mx-auto w-full max-w-[640px]"
            style={{ aspectRatio: "640 / 400" }}
          >
            {/* Grid + Lines + Orb (SVG, fills parent) */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 640 400"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid */}
              <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#222" strokeWidth="1"/>
                </pattern>
                <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7fb8ff" stopOpacity="0.15" />
                </linearGradient>
                <filter id="orbGlow">
                  <feGaussianBlur stdDeviation="6" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="640" height="400" fill="url(#grid)" opacity="0.25" />

              {/* Track background */}
              <path
                d="M100 100 L300 100 L300 280 L520 280"
                stroke="#2a2a2a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Animated track draw-in */}
              <motion.path
                d="M100 100 L300 100 L300 280 L520 280"
                stroke="url(#trackGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray="900"
                initial={{ strokeDashoffset: 900, opacity: 0 }}
                whileInView={{ strokeDashoffset: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
              />

              {/* Orb — outer glow */}
              <motion.circle
                r="22"
                fill="#4f8cff"
                opacity={0.12}
                filter="url(#orbGlow)"
                animate={{ cx: ORB_X, cy: ORB_Y }}
                transition={{ duration: ORB_DURATION, repeat: Infinity, ease: "linear" }}
              />
              {/* Orb — mid */}
              <motion.circle
                r="13"
                fill="#6aa3ff"
                opacity={0.4}
                animate={{ cx: ORB_X, cy: ORB_Y }}
                transition={{ duration: ORB_DURATION, repeat: Infinity, ease: "linear" }}
              />
              {/* Orb — core */}
              <motion.circle
                r="6"
                fill="#7fb8ff"
                opacity={1}
                animate={{ cx: ORB_X, cy: ORB_Y }}
                transition={{ duration: ORB_DURATION, repeat: Infinity, ease: "linear" }}
              />
            </svg>

            {/* Nodes — positioned using % of the 640×400 coordinate space */}
            {NODE_DEFS.map((node, i) => {
              const Icon = node.icon;
              const isActive = activeNodes.has(i);

              // Convert SVG coords to % of 640×400, then offset by half the node size
              // Node is 130px wide, 130px tall in the 640px space → 130/640 = ~20.3%
              const leftPct = (node.svgX / 640) * 100;
              const topPct = (node.svgY / 400) * 100;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -5, scale: 1.04 }}
                  animate={{
                    borderColor: isActive ? "rgba(79,140,255,0.45)" : "#1f1f1f",
                    boxShadow: isActive
                      ? "0 0 0 1px rgba(79,140,255,0.12), 0 0 24px rgba(127,184,255,0.2)"
                      : "0 4px 16px rgba(0,0,0,0.5)",
                  }}
                  className="absolute cursor-default select-none rounded-2xl border p-4"
                  style={{
                    // Centre the node on its SVG coordinate
                    left: `calc(${leftPct}% - 65px)`,
                    top: `calc(${topPct}% - 60px)`,
                    width: 130,
                    background: isActive
                      ? "linear-gradient(145deg, #0b1426, #070a14)"
                      : "#070707",
                    transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
                  }}
                >
                  <motion.div
                  >
                    <Icon
                      size={25}
                      style={{
                        color: isActive ? "#7fb8ff" : "#52525b",
                        transition: "color 0.4s ease",
                      }}
                    />
                  </motion.div>

                  <p
                    className="mt-3 whitespace-pre-line font-semibold text-[13px] leading-snug"
                    style={{
                      color: isActive ? "#a9c6ff" : "#71717a",
                      transition: "color 0.4s ease",
                    }}
                  >
                    {node.title}
                  </p>

                  {/* Pulse dot */}
                  <motion.span
                    className="absolute top-2.5 right-2.5 size-2 rounded-full"
                    animate={{
                      backgroundColor: isActive ? "#4f8cff" : "#27272a",
                      opacity: isActive ? [1, 0.4, 1] : 1,
                    }}
                    transition={{
                      backgroundColor: { duration: 0.4 },
                      opacity: { duration: 1.8, repeat: Infinity },
                    }}
                  />
                </motion.div>
              );
            })}

            {/* Floating Target decoration */}
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [0, 4, 0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute"
              style={{ right: "2%", top: "4%" }}
            >
              <Target size={40} color="#27272a" strokeWidth={1.5} />
            </motion.div>
          </div>
        </div>

        <div className="h-8 md:h-10" />
      </div>
    </div>
  );
}