"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Target, Lock, Trophy, MessageSquareMore, Network } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type DiagramNode = {
  title: string;
  icon: LucideIcon;
  /** Anchor point — path, orb, and box center */
  x: number;
  y: number;
};

type DiagramLayout = {
  id: "mobile" | "desktop";
  viewBox: { w: number; h: number };
  maxWidth: number;
  nodeW: number;
  nodeH: number;
  iconSize: number;
  titleSize: number;
  nodes: DiagramNode[];
  orbRadii: [number, number, number];
  trackWidth: number;
};

const MOBILE_LAYOUT: DiagramLayout = {
  id: "mobile",
  viewBox: { w: 360, h: 320 },
  maxWidth: 420,
  nodeW: 96,
  nodeH: 78,
  iconSize: 17,
  titleSize: 10.5,
  // 2×2 zigzag: TL → TR → BL → BR (true cross, not stacked on the right)
  nodes: [
    { title: "Goal\nAnalysis", icon: Network, x: 50, y: 88 },
    { title: "Daily\nTasks", icon: Lock, x: 180, y: 88 },
    { title: "Progress\nTracking", icon: MessageSquareMore, x: 180, y: 218 },
    { title: "Dream\nOffer", icon: Trophy, x: 310, y: 218 },
  ],
  orbRadii: [12, 7, 3.5],
  trackWidth: 1.75,
};

const DESKTOP_LAYOUT: DiagramLayout = {
  id: "desktop",
  viewBox: { w: 640, h: 400 },
  maxWidth: 640,
  nodeW: 130,
  nodeH: 100,
  iconSize: 25,
  titleSize: 13,
  nodes: [
    { title: "Goal\nAnalysis", icon: Network, x: 100, y: 100 },
    { title: "Daily\nTasks", icon: Lock, x: 300, y: 100 },
    { title: "Progress\nTracking", icon: MessageSquareMore, x: 300, y: 280 },
    { title: "Dream\nOffer", icon: Trophy, x: 520, y: 280 },
  ],
  orbRadii: [22, 13, 6],
  trackWidth: 2,
};

const ORB_DURATION = 5;
const ARRIVE_AT = [
  0,
  ORB_DURATION * (1 / 3),
  ORB_DURATION * (2 / 3),
  ORB_DURATION - 0.05,
];

function buildPath(nodes: DiagramNode[]) {
  return nodes
    .map((node, index) => `${index === 0 ? "M" : "L"}${node.x} ${node.y}`)
    .join(" ");
}

function useDiagramLayout() {
  const [layout, setLayout] = useState<DiagramLayout>(MOBILE_LAYOUT);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setLayout(mq.matches ? DESKTOP_LAYOUT : MOBILE_LAYOUT);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return layout;
}

type NodeCardProps = {
  node: DiagramNode;
  index: number;
  isActive: boolean;
  layout: DiagramLayout;
  interactive: boolean;
};

function NodeCard({ node, index, isActive, layout, interactive }: NodeCardProps) {
  const Icon = node.icon;
  const halfW = layout.nodeW / 2;
  const halfH = layout.nodeH / 2;
  const padding = layout.id === "mobile" ? 10 : 14;

  return (
    <foreignObject
      x={node.x - halfW}
      y={node.y - halfH}
      width={layout.nodeW}
      height={layout.nodeH}
      className="overflow-visible"
    >
      <motion.div
        {...({ xmlns: "http://www.w3.org/1999/xhtml" } as object)}
        initial={{ opacity: 0, scale: 0.82 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.45,
          delay: index * 0.12,
          ease: [0.22, 1, 0.36, 1],
        }}
        whileHover={interactive ? { scale: 1.04 } : undefined}
        animate={{
          borderColor: isActive ? "rgba(79,140,255,0.45)" : "#1f1f1f",
          boxShadow: isActive
            ? layout.id === "mobile"
              ? "0 0 0 1px rgba(79,140,255,0.12), 0 0 16px rgba(127,184,255,0.2)"
              : "0 0 0 1px rgba(79,140,255,0.12), 0 0 24px rgba(127,184,255,0.2)"
            : layout.id === "mobile"
              ? "0 2px 10px rgba(0,0,0,0.5)"
              : "0 4px 16px rgba(0,0,0,0.5)",
        }}
        className={`relative box-border h-full w-full cursor-default select-none border ${
          layout.id === "mobile" ? "rounded-xl" : "rounded-2xl"
        }`}
        style={{
          padding,
          background: isActive
            ? "linear-gradient(145deg, #0b1426, #070a14)"
            : "#070707",
          transition:
            "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        <Icon
          size={layout.iconSize}
          style={{
            color: isActive ? "#7fb8ff" : "#52525b",
            transition: "color 0.4s ease",
          }}
        />
        <p
          className="mt-2 whitespace-pre-line font-semibold leading-snug"
          style={{
            fontSize: layout.titleSize,
            color: isActive ? "#a9c6ff" : "#71717a",
            transition: "color 0.4s ease",
          }}
        >
          {node.title}
        </p>
        <motion.span
          className={`absolute rounded-full ${
            layout.id === "mobile"
              ? "top-2 right-2 size-1.5"
              : "top-2.5 right-2.5 size-2"
          }`}
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
    </foreignObject>
  );
}

export default function RoadmapCard() {
  const layout = useDiagramLayout();
  const reduceMotion = useReducedMotion();

  const [activeNodes, setActiveNodes] = useState<Set<number>>(
    () => new Set([0, 1, 2, 3]),
  );

  const pathD = useMemo(() => buildPath(layout.nodes), [layout]);
  const orbKeyframes = useMemo(() => {
    const xs = layout.nodes.map((node) => node.x);
    const ys = layout.nodes.map((node) => node.y);
    const last = layout.nodes.length - 1;
    return {
      cx: [...xs, xs[last]],
      cy: [...ys, ys[last]],
    };
  }, [layout]);

  useEffect(() => {
    if (reduceMotion) {
      setActiveNodes(new Set([0, 1, 2, 3]));
      return;
    }

    setActiveNodes(new Set([0]));
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = () => {
      setActiveNodes(new Set([0]));
      ARRIVE_AT.forEach((t, i) => {
        if (i === 0) return;
        timers.push(
          setTimeout(() => {
            setActiveNodes((prev) => new Set([...prev, i]));
          }, t * 1000),
        );
      });
    };

    schedule();
    const interval = setInterval(schedule, ORB_DURATION * 1000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [reduceMotion, layout.id]);

  const trackGradId = `trackGrad-${layout.id}`;
  const orbGlowId = `orbGlow-${layout.id}`;
  const pathLength = layout.id === "mobile" ? 720 : 900;
  const [outerR, midR, coreR] = layout.orbRadii;

  return (
    <div className="relative flex h-full min-h-0 flex-col justify-between overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="relative flex flex-1 flex-col justify-between p-5 sm:p-10 md:p-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="mb-3 text-2xl font-bold uppercase tracking-tight sm:mb-5 sm:text-3xl md:text-4xl">
            <span className="text-white">ADAPTIVE ROADMAPS</span>
          </h3>
          <p className="max-w-[650px] text-sm leading-relaxed text-zinc-400 md:text-lg">
            Start with a roadmap built around your goals and schedule.
          </p>
          <p className="mt-3 max-w-[650px] text-sm leading-relaxed text-zinc-400 sm:mt-4 md:text-lg">
            As you progress, AI continuously analyzes your performance and
            automatically adjusts your roadmap to match your learning pace.
          </p>
        </motion.div>

        <div className="mt-8 w-full min-h-0 flex-1 sm:mt-12">
          <div
            className="relative mx-auto w-full max-h-[min(52vh,420px)] sm:max-h-none"
            style={{
              maxWidth: layout.maxWidth,
              aspectRatio: `${layout.viewBox.w} / ${layout.viewBox.h}`,
            }}
          >
            <svg
              className="h-full w-full"
              viewBox={`0 0 ${layout.viewBox.w} ${layout.viewBox.h}`}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <defs>
                <radialGradient
                  id={`diagramFade-${layout.id}`}
                  cx="50%"
                  cy="50%"
                  r="55%"
                >
                  <stop offset="0%" stopColor="#1a1a1a" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0a0a0a" stopOpacity="0" />
                </radialGradient>
                <linearGradient
                  id={trackGradId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2={layout.id === "mobile" ? "100%" : "0%"}
                >
                  <stop offset="0%" stopColor="#4f8cff" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#7fb8ff" stopOpacity="0.15" />
                </linearGradient>
                <filter id={orbGlowId}>
                  <feGaussianBlur
                    stdDeviation={layout.id === "mobile" ? 4 : 6}
                    result="blur"
                  />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <rect
                width={layout.viewBox.w}
                height={layout.viewBox.h}
                fill={`url(#diagramFade-${layout.id})`}
              />

              {/* Track + orb sit beneath node cards */}
              <g>
                <path
                  d={pathD}
                  stroke="#2a2a2a"
                  strokeWidth={
                    layout.trackWidth + (layout.id === "desktop" ? 1 : 0.25)
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                <motion.path
                  d={pathD}
                  stroke={`url(#${trackGradId})`}
                  strokeWidth={layout.trackWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={pathLength}
                  initial={{ strokeDashoffset: pathLength, opacity: 0 }}
                  whileInView={{ strokeDashoffset: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
                />

                {!reduceMotion && (
                  <>
                    <motion.circle
                      r={outerR}
                      fill="#4f8cff"
                      opacity={0.12}
                      filter={`url(#${orbGlowId})`}
                      animate={{ cx: orbKeyframes.cx, cy: orbKeyframes.cy }}
                      transition={{
                        duration: ORB_DURATION,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.circle
                      r={midR}
                      fill="#6aa3ff"
                      opacity={0.4}
                      animate={{ cx: orbKeyframes.cx, cy: orbKeyframes.cy }}
                      transition={{
                        duration: ORB_DURATION,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                    <motion.circle
                      r={coreR}
                      fill="#7fb8ff"
                      animate={{ cx: orbKeyframes.cx, cy: orbKeyframes.cy }}
                      transition={{
                        duration: ORB_DURATION,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </>
                )}

                {reduceMotion &&
                  layout.nodes.map((node, index) => (
                    <circle
                      key={`static-orb-${index}`}
                      cx={node.x}
                      cy={node.y}
                      r={coreR}
                      fill="#7fb8ff"
                      opacity={index === layout.nodes.length - 1 ? 1 : 0.35}
                    />
                  ))}
              </g>

              {layout.nodes.map((node, index) => (
                <NodeCard
                  key={`${layout.id}-${node.title}`}
                  node={node}
                  index={index}
                  isActive={activeNodes.has(index)}
                  layout={layout}
                  interactive={layout.id === "desktop"}
                />
              ))}

              {layout.id === "desktop" && (
                <foreignObject x={560} y={8} width={48} height={48}>
                  <motion.div
                    {...({ xmlns: "http://www.w3.org/1999/xhtml" } as object)}
                    animate={
                      reduceMotion
                        ? undefined
                        : { y: [-4, 4, -4], rotate: [0, 4, 0, -4, 0] }
                    }
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="flex h-full w-full items-center justify-center"
                  >
                    <Target size={40} color="#27272a" strokeWidth={1.5} />
                  </motion.div>
                </foreignObject>
              )}
            </svg>
          </div>
        </div>

        <div className="h-6 sm:h-8 md:h-10" />
      </div>
    </div>
  );
}
