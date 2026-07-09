"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../providers/AuthProvider";
import {
  CircleDetail,
  CirclePostWithAuthor,
  CircleCommentWithAuthor,
  LeaderboardEntry,
  CircleInsights,
  CircleActivityWithProfile,
} from "@/types/executioncircle.types";
import * as api from "../services/executioncircle.service";
import Sidebar from "../components/layout/Sidebar";
import {
  TrendingUp,
  Zap,
  Target,
  Flame,
  Plus,
  Activity,
  Award,
  ArrowRight,
  X,
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Menu,
  Camera,
  Check,
  Users,
  Clock,
  Trophy,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import ExecutionSkeleton from "./ExecutionSkeleton";

// ── Design System ──────────────────────────────────────────
const COLORS = {
  bg: "bg-[#070b0a]",
  surface: "bg-zinc-950/40",
  card: "bg-[#0d0e12]/30 border border-zinc-800/70 hover:border-zinc-700/80 transition-all duration-300",
  border: "border-zinc-800/60",
  accent: "text-white",
  accentBg: "bg-white hover:bg-zinc-200 transition-colors",
  text: "text-zinc-200",
  textMuted: "text-zinc-500",
};

// Animation variants
const uiVariants = {
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
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
} as const;

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-[#0d0e12]/30 border border-zinc-800/70 hover:border-zinc-700/80 rounded-2xl transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const Badge = ({
  children,
  variant = "accent",
}: {
  children: React.ReactNode;
  variant?: "accent" | "success";
}) => (
  <span
    className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase tracking-wider border ${variant === "accent"
        ? "bg-zinc-800/60 text-zinc-300 border-zinc-700/60"
        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}
  >
    {children}
  </span>
);

const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <div className={`${className} animate-pulse rounded-md bg-zinc-900`} />
);

// ── Avatar helper — fixes the double-render bug ────────────
function Avatar({
  url,
  name,
  size = 10,
}: {
  url: string | null | undefined;
  name: string | null | undefined;
  size?: number;
}) {
  const sizeClass = `h-${size} w-${size}`;
  if (url) {
    return (
      <img
        src={url}
        alt={name || ""}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 flex-shrink-0`}
    >
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

function isCurrentUserMember(
  member: CircleDetail["members"][number],
  currentUserId?: string | null,
) {
  return (
    !!currentUserId &&
    (member.user_id === currentUserId || member.profile?.id === currentUserId)
  );
}

// ── Activity label helper ──────────────────────────────────
function activityLabel(type: string, metadata?: Record<string, any> | null): string {
  if (metadata?.action === "comment_created") {
    return "commented";
  }

  if (metadata?.action === "like_added") {
    return "liked a post";
  }

  if (metadata?.action === "challenge_completed") {
    return "completed a challenge";
  }

  switch (type) {
    case "post_created":
      return "shared an update";
    case "member_joined":
      return "joined the circle";
    case "proof_uploaded":
      return "uploaded a proof";
    case "task_completed":
      return "completed a task";
    case "streak_milestone":
      return "hit a streak milestone";
    case "comment_created":
      return "commented";
    case "like_added":
      return "liked a post";
    case "challenge_completed":
      return "completed a challenge";
    default:
      return "was active";
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getCircleMetrics(circle: CircleDetail) {
  return [
    {
      label: "Health Score",
      value: `${circle.health_score}%`,
      trend: "This week",
      icon: <Target size={16} />,
    },
    {
      label: "Weekly Posts",
      value: `${circle.weekly_activity_count}`,
      trend: "Circle activity",
      icon: <Activity size={16} />,
    },
    {
      label: "Members",
      value: `${circle.member_count}`,
      trend: "In your circle",
      icon: <Zap size={16} />,
    },
    {
      label: "Top Streak",
      value: `${circle.top_performers[0]?.streak_days ?? 0}d`,
      trend: "Best in circle",
      icon: <Flame size={16} />,
    },
    {
      label: "Top Score",
      value: `${circle.top_performers[0]?.total_points ?? 0}`,
      trend: "Highest points",
      icon: <TrendingUp size={16} />,
    },
  ];
}

// ── How It Works Modal ─────────────────────────────────────
function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div
        className="bg-[#0d0e12] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-extrabold text-lg tracking-tight">
            How Execution Circles Work
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Matched by Goal & Level",
              desc: "You are grouped with peers who share your goal, timeline, and current skill level.",
            },
            {
              step: "2",
              title: "Weekly Rematching",
              desc: "Every week circles are reshuffled based on accountability scores so you always train with peers at your level.",
            },
            {
              step: "3",
              title: "Score by Action",
              desc: "Completing daily tasks (+2 pts), uploading proofs (+3 pts), and finishing weekly challenges (+50 pts) all raise your score.",
            },
            {
              step: "4",
              title: "Rank Up",
              desc: "Score 90+ to reach Diamond rank. Your rank determines which circle you are placed in next cycle.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-zinc-900 border border-zinc-800 text-white font-mono text-xs flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">
                  {item.title}
                </p>
                <p className="text-zinc-400 text-xs mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-sm transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

// ── Request Change Modal ───────────────────────────────────
function RequestChangeModal({
  circleId,
  onClose,
}: {
  circleId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await api.requestChange(circleId, reason);
      setDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div
        className="bg-[#0d0e12] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-extrabold text-lg tracking-tight">
            Request Circle Change
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {done ? (
          <div className="text-center py-6">
            <p className="text-emerald-400 font-bold text-lg mb-2">
              Request Submitted
            </p>
            <p className="text-zinc-400 text-sm">
              Our team will review your request within 24–48 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-white text-black font-bold rounded-xl text-sm hover:bg-zinc-200 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
              Tell us why you'd like to be placed in a different circle.
            </p>
            <textarea
              className="w-full bg-zinc-950/40 border border-zinc-800 rounded-xl p-3 text-sm outline-none text-white h-28 resize-none focus:border-zinc-700 transition-colors"
              placeholder="e.g. The circle is not active enough..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-zinc-800 bg-zinc-900/30 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !reason.trim()}
                className="flex-1 py-2 bg-white text-black font-bold rounded-xl text-sm disabled:opacity-50 hover:bg-zinc-200 transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Mobile Hero ────────────────────────────────────────────
function MobileCircleHero({
  circle,
  onHowItWorks,
}: {
  circle: CircleDetail;
  onHowItWorks: () => void;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h2 className={`${COLORS.text} font-bold text-base truncate`}>
              {circle.name}
            </h2>
            <Badge variant="success">Active</Badge>
          </div>
          <p className={`${COLORS.textMuted} text-[11px] leading-snug`}>
            Matched with {circle.member_count} focused peers
          </p>
        </div>
        <button
          onClick={onHowItWorks}
          className="text-white text-[11px] font-medium shrink-0 min-h-[44px] px-1 hover:underline"
        >
          How it works?
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-zinc-950/40 border border-zinc-900 p-2.5 text-center">
          <p
            className={`${COLORS.textMuted} text-[9px] uppercase font-medium mb-0.5`}
          >
            Level
          </p>
          <p className={`${COLORS.text} text-xs font-bold truncate`}>
            {circle.current_level.toUpperCase()}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-950/40 border border-zinc-900 p-2.5 text-center">
          <p
            className={`${COLORS.textMuted} text-[9px] uppercase font-medium mb-0.5`}
          >
            Health
          </p>
          <p className="text-emerald-400 text-xs font-bold">
            {circle.health_score}%
          </p>
        </div>
        <div className="rounded-xl bg-zinc-950/40 border border-zinc-900 p-2.5 text-center">
          <p
            className={`${COLORS.textMuted} text-[9px] uppercase font-medium mb-0.5`}
          >
            Members
          </p>
          <p className={`${COLORS.text} text-xs font-bold`}>
            {circle.member_count}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Mobile Accountability ────────────────────────────────────
function MobileAccountabilityRow({
  circle,
  currentUserId,
}: {
  circle: CircleDetail;
  currentUserId?: string | null;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className={`${COLORS.text} font-semibold text-sm`}>
          Your Accountability Circle
        </h2>
        <p className={`${COLORS.textMuted} text-[10px]`}>Refreshes in 6d</p>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-1 no-scrollbar -mx-1 px-1">
        {circle.members.map((member) => {
          const isCurrentUser = isCurrentUserMember(member, currentUserId);

          return (
            <div
              key={member.id}
              className="flex flex-col items-center gap-2 min-w-[72px] shrink-0"
            >
              <div className="relative">
                <Avatar
                  url={member.profile?.avatar_url}
                  name={member.profile?.full_name}
                  size={20}
                />
                {isCurrentUser && (
                  <div className="absolute -bottom-1 -right-1 bg-white text-black text-[9px] font-bold px-1 py-0.5 rounded-full">
                    YOU
                  </div>
                )}
              </div>
              <div className="text-center w-[72px]">
                <p className={`${COLORS.text} text-xs font-medium truncate`}>
                  {member.profile?.full_name || "Unknown"}
                </p>
                <p className={`${COLORS.textMuted} text-[10px]`}>
                  {member.weekly_completion || 0}%
                </p>
              </div>
            </div>
          );
        })}
        <button
          type="button"
          className="h-20 w-20 min-h-[44px] min-w-[44px] rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-white transition-all shrink-0"
          aria-label="Add member"
        >
          <Plus size={22} />
        </button>
      </div>
    </div>
  );
}

// ── Mobile Quick Stats ───────────────────────────────────────
function MobileQuickStats({ circle }: { circle: CircleDetail }) {
  const metrics = getCircleMetrics(circle);

  return (
    <div>
      <h2 className={`${COLORS.text} font-semibold text-sm mb-3`}>
        Quick Stats
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((m, i) => (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5">
              {m.icon}
              <span className="text-[10px] font-medium uppercase tracking-tight truncate">
                {m.label}
              </span>
            </div>
            <div className={`${COLORS.text} text-base font-bold leading-none`}>
              {m.value}
            </div>
            <div className={`${COLORS.textMuted} text-[9px] mt-1 truncate`}>
              {m.trend}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Mobile Leaderboard ───────────────────────────────────────
function MobileLeaderboard({
  leaderboard,
}: {
  leaderboard: LeaderboardEntry[];
}) {
  return (
    <Card className="p-3">
      <h3
        className={`${COLORS.text} font-semibold text-sm mb-3 flex items-center gap-2`}
      >
        <Award size={15} className="text-yellow-500" /> Top Performers
      </h3>
      {leaderboard.length === 0 ? (
        <Skeleton className="h-16" />
      ) : (
        <div className="space-y-2">
          {leaderboard.slice(0, 5).map((entry, i) => (
            <div
              key={entry.member.id}
              className="flex items-center gap-2 min-h-[44px]"
            >
              <span
                className={`text-xs font-bold w-5 shrink-0 ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-600" : COLORS.textMuted}`}
              >
                #{entry.rank}
              </span>
              <Avatar
                url={entry.member.profile?.avatar_url}
                name={entry.member.profile?.full_name}
                size={8}
              />
              <div className="flex-1 min-w-0">
                <p className={`${COLORS.text} text-xs font-medium truncate`}>
                  {entry.member.profile?.full_name || "Unknown"}
                </p>
                <p className={`${COLORS.textMuted} text-[10px]`}>
                  {entry.member.streak_days}d streak
                </p>
              </div>
              <span className={`${COLORS.accent} text-xs font-bold shrink-0`}>
                {entry.points}pts
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Mobile Insights ──────────────────────────────────────────
function MobileInsights({ insights }: { insights: CircleInsights | null }) {
  return (
    <Card className="p-3">
      <h3
        className={`${COLORS.text} font-semibold text-sm mb-3 flex items-center gap-2`}
      >
        <Activity size={15} className="text-emerald-400" /> Circle Insights
      </h3>
      {insights ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className={`${COLORS.textMuted} text-[11px]`}>
              Better than similar circles
            </p>
            <p className="text-emerald-400 font-bold text-sm">
              {insights.better_than}%
            </p>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className={COLORS.textMuted}>Task Completion</span>
              <span className={COLORS.text}>{insights.avg_completion}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${insights.avg_completion}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg bg-zinc-950/40 border border-zinc-900 px-3 py-2 flex justify-between items-center min-h-[44px]">
              <span className={`${COLORS.textMuted} text-[11px]`}>
                Avg Score
              </span>
              <span className={`${COLORS.text} text-sm font-bold font-mono`}>
                {insights.avg_score}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <Skeleton className="h-24" />
      )}
    </Card>
  );
}

// ── Mobile Upgrade ───────────────────────────────────────────
function MobileUpgrade() {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2 mb-2">
        <Trophy size={15} className="text-yellow-500" />
        <h3 className={`${COLORS.text} font-semibold text-sm`}>
          Next Circle Upgrade
        </h3>
      </div>
      <p className={`${COLORS.textMuted} text-[11px] mb-2 leading-snug`}>
        Maintain 90%+ consistency for 7 more days to unlock Diamond Circle
      </p>
      <div className="h-2 w-full bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden p-[1px] mb-1.5">
        <div
          className="h-full bg-yellow-500 rounded-full"
          style={{ width: "43%" }}
        />
      </div>
      <p className={`${COLORS.textMuted} text-[10px] font-mono text-right`}>3/7 days</p>
    </Card>
  );
}

// ── Mobile Recent Activity ───────────────────────────────────
function MobileRecentActivity({
  activities,
}: {
  activities: CircleActivityWithProfile[];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full p-3 flex items-center justify-between min-h-[44px] text-left focus:outline-none"
      >
        <h3 className={`${COLORS.text} font-semibold text-sm`}>
          Recent Circle Activity
        </h3>
        {expanded ? (
          <ChevronUp size={18} className={COLORS.textMuted} />
        ) : (
          <ChevronDown size={18} className={COLORS.textMuted} />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-900 pt-2">
          {activities.length === 0 ? (
            <p className={`${COLORS.textMuted} text-xs text-center py-3`}>
              No activity yet. Be the first to post!
            </p>
          ) : (
            <div className="space-y-2">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-2 min-h-[44px] py-1"
                >
                  <Avatar
                    url={act.profile?.avatar_url}
                    name={act.profile?.full_name}
                    size={7}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`${COLORS.text} text-xs font-medium`}>
                      {act.profile?.full_name || "Someone"}
                    </span>
                    <span className={`${COLORS.textMuted} text-xs ml-1`}>
                      {activityLabel(act.activity_type, act.metadata)}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                    {timeAgo(act.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ── Mobile Request Change ──────────────────────────────────────
function MobileRequestChange({
  onRequestChange,
}: {
  onRequestChange: () => void;
}) {
  return (
    <Card className="p-3 text-center">
      <h3 className={`${COLORS.text} font-semibold text-sm mb-1`}>
        Need a Change?
      </h3>
      <p className={`${COLORS.textMuted} text-[11px] mb-3`}>
        Not feeling the right match? Request a circle change.
      </p>
      <button
        type="button"
        onClick={onRequestChange}
        className={`w-full py-2.5 min-h-[44px] rounded-xl border ${COLORS.border} ${COLORS.text} text-xs font-medium hover:bg-white/5 transition-colors`}
      >
        Request Change
      </button>
    </Card>
  );
}

// ── Hero ───────────────────────────────────────────────────
function CircleHero({
  circle,
  onHowItWorks,
}: {
  circle: CircleDetail;
  onHowItWorks: () => void;
}) {
  return (
    <div className="mb-8">
      {/* Header OS Style */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 pb-6 border-b border-zinc-900">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
              Accountability Matrix
            </span>
            <div className="h-1 w-1 rounded-full bg-zinc-600" />
            <Badge variant="success">Active Circle</Badge>
          </div>
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white">
            {circle.name}
          </h1>
          <p className="text-sm text-zinc-400 mt-1.5">
            You're matched with {circle.member_count} focused peers on a similar journey.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Target size={20} className="text-zinc-200" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Your Circle
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-white font-bold text-sm truncate max-w-[120px]">
                {circle.name}
              </span>
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Trophy size={20} className="text-yellow-500" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Level
            </p>
            <span className="text-white font-bold text-sm mt-0.5 block">
              {circle.current_level.toUpperCase()}
            </span>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Health Score
            </p>
            <span className="text-emerald-400 font-bold text-base mt-0.5 block">
              {circle.health_score}%
            </span>
          </div>
        </Card>
      </div>

      <div
        className="mt-4 p-3.5 rounded-xl border border-zinc-800 bg-[#0d0e12]/20 flex items-center justify-between text-xs text-zinc-400 gap-3"
      >
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-yellow-500 shrink-0" />
          <span>
            Matched based on goal alignment, timeline pacing, and consistency metrics.
          </span>
        </div>
        <button
          onClick={onHowItWorks}
          className="text-white font-semibold hover:underline flex items-center gap-1 shrink-0 focus:outline-none"
        >
          <span>How it works</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Accountability Row ─────────────────────────────────────
function AccountabilityRow({
  circle,
  currentUserId,
}: {
  circle: CircleDetail;
  currentUserId?: string | null;
}) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${COLORS.text} font-semibold text-lg`}>
          Your Accountability Circle
        </h2>
        <p className={`${COLORS.textMuted} text-xs font-mono`}>
          Circle refreshes in 6 days
        </p>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
        {circle.members.map((member) => {
          const isCurrentUser = isCurrentUserMember(member, currentUserId);

          return (
            <div
              key={member.id}
              className="flex flex-col items-center gap-3 min-w-[80px]"
            >
              <div className="relative">
                <Avatar
                  url={member.profile?.avatar_url}
                  name={member.profile?.full_name}
                  size={20}
                />
                {isCurrentUser && (
                  <div className="absolute -bottom-1 -right-1 bg-white text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md font-mono">
                    YOU
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <button
          className="h-20 w-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-white transition-all flex-shrink-0 focus:outline-none"
          aria-label="Add member"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="mt-6 p-4 rounded-xl border border-zinc-800 bg-zinc-950/20 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Target size={16} className="text-zinc-200" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Circle Focus
            </p>
            <p className="text-white text-sm font-semibold mt-0.5">
              {circle.goal}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:border-l border-zinc-900 md:pl-4">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Clock size={16} className="text-zinc-200" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Duration
            </p>
            <p className="text-white text-sm font-semibold mt-0.5">
              {circle.duration_months} Months
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:border-l border-zinc-900 md:pl-4">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
            <Users size={16} className="text-zinc-200" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
              Members
            </p>
            <p className="text-white text-sm font-semibold mt-0.5">
              {circle.member_count} Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Performance ────────────────────────────────────────────
function PerformanceSection({ circle }: { circle: CircleDetail }) {
  const metrics = getCircleMetrics(circle);

  return (
    <div className="mb-8">
      <h2 className="text-white font-semibold text-lg mb-6">
        Circle Performance
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-3 [&_svg]:h-3.5 [&_svg]:w-3.5">
              {m.icon}
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                {m.label}
              </span>
            </div>
            <div className="text-white text-xl font-bold font-mono mb-1">
              {m.value}
            </div>
            <div className="text-zinc-500 text-[10px] font-mono">{m.trend}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────
function PostCard({
  post,
  onCommentAdded,
}: {
  post: CirclePostWithAuthor;
  onCommentAdded: (postId: string) => void;
}) {
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<CircleCommentWithAuthor[]>(
    post.recent_comments,
  );
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  const isProof = post.content.includes("[IMAGE:");
  const cleanContent = post.content.replace(/\[IMAGE:.*?\]/s, "").trim();
  const imgMatch = post.content.match(/\[IMAGE:(.*?)\]/);

  const handleLike = async () => {
    if (togglingLike) return;
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    setTogglingLike(true);
    try {
      const result = await api.toggleLike(post.id);
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch (e) {
      setLiked((prev) => !prev);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
      console.error(e);
    } finally {
      setTogglingLike(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const { comment } = await api.createComment({
        post_id: post.id,
        content: commentText.trim(),
      });
      setComments((prev) => [
        ...prev,
        {
          ...comment,
          author: {
            id: comment.user_id,
            full_name: "You",
            avatar_url: null,
            username: null,
          },
        },
      ]);
      setCommentText("");
      onCommentAdded(post.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3 mb-4">
        <Avatar
          url={post.author?.avatar_url}
          name={post.author?.full_name}
          size={10}
        />
        <div>
          <span className="text-white font-semibold text-sm">
            {post.author?.full_name || "Unknown"}
          </span>
          <p className="text-zinc-500 font-mono text-[10px] mt-0.5">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {cleanContent && (
        <p className="text-zinc-200 text-sm mb-4 whitespace-pre-wrap leading-relaxed">
          {cleanContent}
        </p>
      )}
      {isProof && imgMatch && (
        <img
          src={imgMatch[1]}
          alt="Proof"
          className="rounded-lg max-h-64 object-cover mb-4 w-full border border-zinc-800/80"
        />
      )}

      <div className="flex items-center gap-4 border-t border-zinc-900 pt-3.5">
        <button
          onClick={handleLike}
          disabled={togglingLike}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? "text-red-400" : "text-zinc-500 hover:text-red-400"}`}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-white transition-colors"
        >
          <MessageCircle size={14} />
          <span>
            {comments.length +
              (post.comments_count - post.recent_comments.length > 0
                ? post.comments_count - post.recent_comments.length
                : 0)}
          </span>
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t border-zinc-900 pt-4 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2.5">
              <Avatar
                url={c.author?.avatar_url}
                name={c.author?.full_name}
                size={7}
              />
              <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl px-3 py-2 flex-1">
                <p className="text-white text-xs font-semibold">
                  {c.author?.full_name || "Unknown"}
                </p>
                <p className="text-zinc-300 text-xs mt-1 leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
              className="flex-1 bg-zinc-950/40 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-colors"
            />
            <button
              onClick={handleComment}
              disabled={submittingComment || !commentText.trim()}
              className="p-2 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── Feed Composer & Posts ────────────────────────────────────
function FeedComposer({
  circleId,
  onFeedUpdated,
  compact = false,
}: {
  circleId: string;
  onFeedUpdated: () => void;
  compact?: boolean;
}) {
  const [content, setContent] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim() && !proofUrl.trim()) return;
    setPosting(true);
    try {
      if (proofUrl.trim()) {
        await api.uploadProof(circleId, proofUrl.trim(), content.trim());
      } else {
        await api.createPost({
          circle_id: circleId,
          content: content.trim(),
          post_type: "update",
        });
      }
      setContent("");
      setProofUrl("");
      onFeedUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className={compact ? "p-0" : "p-0 mb-6"}>
      <div className="flex flex-col gap-0">
        <div className="flex flex-col gap-3 p-4">
          <textarea
            className={`
              w-full bg-zinc-950/20 border border-zinc-800 rounded-lg p-3 text-sm
              outline-none focus:border-zinc-700 transition-colors
              text-white ${compact ? "h-20" : "h-24"} resize-none
              placeholder:text-zinc-600
            `}
            placeholder="Share an update, win, or question..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div
            className="flex items-center gap-2 border border-zinc-800 focus-within:border-zinc-700 bg-zinc-950/20 rounded-lg px-3 py-2 transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              type="text"
              placeholder="Paste image URL for proof (optional)"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="flex-1 min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-600"
            />
            {proofUrl.trim() && (
              <div className="flex items-center gap-1 shrink-0 text-emerald-400">
                <Check size={14} />
                <span className="text-xs font-bold font-mono">Added</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px mx-4 bg-zinc-900" />

        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/10">
          <span
            className={`text-[10px] font-mono ${500 - content.length < 20
                ? "text-red-400"
                : 500 - content.length < 80
                  ? "text-amber-400"
                  : "text-zinc-600"
              }`}
          >
            {content.length > 0 ? `${500 - content.length} chars left` : ""}
          </span>

          <button
            onClick={handlePost}
            disabled={posting || (!content.trim() && !proofUrl.trim())}
            className="bg-white cursor-pointer text-black hover:bg-zinc-200 transition-colors font-bold rounded-lg px-5 h-9 text-sm disabled:opacity-40 flex items-center justify-center gap-1.5 focus:outline-none"
          >
            {posting ? (
              "Posting..."
            ) : proofUrl.trim() ? (
              <>
                <Camera size={14} />
                <span>Post with proof</span>
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

function FeedPosts({
  circleId,
  feed,
}: {
  circleId: string;
  feed: CirclePostWithAuthor[];
}) {
  const [morePosts, setMorePosts] = useState<CirclePostWithAuthor[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (feed.length > 0) setCursor(feed[feed.length - 1]?.created_at ?? null);
    setMorePosts([]);
  }, [feed]);

  const handleLoadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await api.getFeed(circleId, cursor);
      setMorePosts((prev) => [...prev, ...res.posts]);
      setCursor(res.cursor ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  const allPosts = [...feed, ...morePosts];

  return (
    <>
      <div className="space-y-3 md:space-y-4">
        {allPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onCommentAdded={() => {
              /* count already updated locally in PostCard */
            }}
          />
        ))}
      </div>

      {cursor && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className={`w-full mt-3 md:mt-4 py-2.5 min-h-[44px] border ${COLORS.border} rounded-xl text-xs font-bold ${COLORS.textMuted} hover:text-[#c4a27a] disabled:opacity-50 flex items-center justify-center gap-2`}
        >
          {loadingMore ? (
            "Loading..."
          ) : (
            <>
              <ChevronDown size={14} /> Load More
            </>
          )}
        </button>
      )}
    </>
  );
}

// ── Feed Section ───────────────────────────────────────────
function FeedSection({
  circleId,
  feed,
  onFeedUpdated,
}: {
  circleId: string;
  feed: CirclePostWithAuthor[];
  onFeedUpdated: () => void;
}) {
  return (
    <div className="pt-8 border-t border-[#171d24]">
      <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Feed</h2>
      <FeedComposer circleId={circleId} onFeedUpdated={onFeedUpdated} />
      <FeedPosts circleId={circleId} feed={feed} />
    </div>
  );
}

function MobileFeedSection({
  circleId,
  feed,
  onFeedUpdated,
}: {
  circleId: string;
  feed: CirclePostWithAuthor[];
  onFeedUpdated: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className={`${COLORS.text} font-semibold text-sm`}>Circle Feed</h2>
      <FeedComposer circleId={circleId} onFeedUpdated={onFeedUpdated} compact />
      <FeedPosts circleId={circleId} feed={feed} />
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────
function CircleSidebar({
  insights,
  circle,
  activities,
  leaderboard,
  onRequestChange,
}: {
  insights: CircleInsights | null;
  circle: CircleDetail;
  activities: CircleActivityWithProfile[];
  leaderboard: LeaderboardEntry[];
  onRequestChange: () => void;
}) {
  return (
    <div className="space-y-6 lg:sticky lg:top-8">
      {/* Insights */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" /> Circle Insights
        </h3>
        {insights ? (
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <p className="text-zinc-500">
                Better than similar circles
              </p>
              <p className="text-emerald-400 font-bold font-mono">
                {insights.better_than}%
              </p>
            </div>
            <div className="my-4 h-20">
              <div className="flex items-end h-full gap-1.5 bg-zinc-950/20 p-2 border border-zinc-900 rounded-xl">
                {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 h-full bg-zinc-900 rounded-[3px] overflow-hidden relative group cursor-pointer"
                  >
                    <div
                      className={`absolute bottom-0 w-full rounded-t-[3px] transition-all duration-300 ${i === 3 ? "bg-white" : "bg-zinc-700 group-hover:bg-zinc-500"
                        }`}
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-zinc-900/60">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Avg Score</span>
                <span className="text-zinc-200 font-mono font-semibold">{insights.avg_score}</span>
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Task Completion</span>
                <span className="text-zinc-200 font-mono font-semibold">{insights.avg_completion}%</span>
              </div>
            </div>
          </div>
        ) : (
          <Skeleton className="h-32" />
        )}
      </Card>

      {/* Mini Leaderboard */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" /> Top Performers
        </h3>
        {leaderboard.length === 0 ? (
          <Skeleton className="h-24" />
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={entry.member.id} className="flex items-center gap-3">
                <span
                  className={`text-sm font-bold font-mono w-5 shrink-0 ${i === 0
                      ? "text-yellow-500"
                      : i === 1
                        ? "text-zinc-300"
                        : i === 2
                          ? "text-amber-600"
                          : "text-zinc-600"
                    }`}
                >
                  #{entry.rank}
                </span>
                <Avatar
                  url={entry.member.profile?.avatar_url}
                  name={entry.member.profile?.full_name}
                  size={8}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">
                    {entry.member.profile?.full_name || "Unknown"}
                  </p>
                  <p className="text-zinc-500 text-[10px] font-mono mt-0.5">
                    {entry.member.streak_days}d streak
                  </p>
                </div>
                <span className="text-zinc-300 text-xs font-bold font-mono shrink-0">
                  {entry.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upgrade */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-yellow-500" />
          <h3 className="text-white font-semibold text-sm">
            Next Circle Upgrade
          </h3>
        </div>
        <p className="text-zinc-400 text-xs mb-3 leading-relaxed">
          Maintain 90%+ consistency for 7 more days to unlock Diamond Circle
        </p>
        <div className="h-2 w-full bg-zinc-900 border border-zinc-800/80 rounded-full overflow-hidden p-[1px] mb-1.5">
          <div className="h-full bg-yellow-500 rounded-full" style={{ width: "43%" }} />
        </div>
        <p className="text-zinc-500 text-[10px] font-mono text-right">3/7 days</p>
      </Card>

      {/* Recent Circle Activity */}
      <Card className="p-5">
        <h3 className="text-white font-semibold mb-4">
          Recent Circle Activity
        </h3>
        {activities.length === 0 ? (
          <p className="text-zinc-500 text-xs text-center py-4">
            No activity yet. Be the first to post!
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-2">
                <Avatar
                  url={act.profile?.avatar_url}
                  name={act.profile?.full_name}
                  size={7}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-white text-xs font-medium">
                    {act.profile?.full_name || "Someone"}
                  </span>
                  <span className="text-zinc-500 text-xs ml-1">
                    {activityLabel(act.activity_type, act.metadata)}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                  {timeAgo(act.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Request Change */}
      <Card className="p-5 text-center">
        <h3 className="text-white font-semibold mb-2 text-sm">
          Need a Change?
        </h3>
        <p className="text-zinc-500 text-xs mb-4 leading-relaxed">
          Not feeling the right match? Request a circle change.
        </p>
        <button
          onClick={onRequestChange}
          className="w-full py-2 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors text-xs font-semibold focus:outline-none"
        >
          Request Change
        </button>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ExecutionCirclePage() {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false); // FIX: Mobile sidebar state
  const [circle, setCircle] = useState<CircleDetail | null>(null);
  const [feed, setFeed] = useState<CirclePostWithAuthor[]>([]);
  const [insights, setInsights] = useState<CircleInsights | null>(null);
  const [activities, setActivities] = useState<CircleActivityWithProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const circleData = await api.getMyCircle();
      console.log("Fetched circle data:", circleData);
      setCircle(circleData);

      const [feedData, insightsData, activitiesData, leaderboardData] =
        await Promise.all([
          api.getFeed(circleData.id),
          api.getInsights(circleData.id).catch(() => null),
          api.getCircleActivity(circleData.id).catch(() => []),
          api.getLeaderboard(circleData.id).catch(() => []),
        ]);

      setFeed(feedData.posts);
      setInsights(insightsData as CircleInsights | null);
      console.log("Fetched insights data:", insightsData);
      setActivities(activitiesData);
      setLeaderboard(leaderboardData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    if (!circle) return;
    try {
      const feedData = await api.getFeed(circle.id);
      setFeed(feedData.posts);
      const acts = await api.getCircleActivity(circle.id).catch(() => []);
      setActivities(acts);
    } catch (e) {
      console.error(e);
    }
  }, [circle]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualJoin = async () => {
    setIsJoining(true);
    try {
      await api.createOrJoinCircle({
        goal: "Build a SaaS product",
        duration_months: 6,
        current_level: "intermediate",
      });
      await loadData();
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <ExecutionSkeleton />;
    }

    if (error || !circle) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#070b0a]">
          <div
            className="bg-[#0d0e12]/30 border border-zinc-800 p-12 rounded-3xl text-center max-w-md shadow-xl"
          >
            <div className="h-20 w-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
              <Target size={40} className="text-zinc-200" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">
              Join Your First Execution Circle
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
              You haven't been matched yet. Let us find your ideal
              high-performance peers.
            </p>
            <button
              onClick={handleManualJoin}
              disabled={isJoining}
              className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50 focus:outline-none"
            >
              {isJoining ? "Matching..." : "Find My Circle"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        variants={uiVariants}
        initial="hidden"
        animate="show"
        className="flex-1 text-[#e8e2d9] px-3 py-4 md:p-8 w-full"
      >
        {showHowItWorks && (
          <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
        )}
        {showChangeModal && (
          <RequestChangeModal
            circleId={circle.id}
            onClose={() => setShowChangeModal(false)}
          />
        )}

        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Execution Circle
          </h1>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile layout (<768px) */}
        <div className="md:hidden max-w-7xl mx-auto space-y-4 pb-6">
          <MobileCircleHero
            circle={circle}
            onHowItWorks={() => setShowHowItWorks(true)}
          />
          <MobileAccountabilityRow circle={circle} currentUserId={user?.id} />
          <MobileFeedSection
            circleId={circle.id}
            feed={feed}
            onFeedUpdated={refreshFeed}
          />
          <MobileQuickStats circle={circle} />
          <MobileLeaderboard leaderboard={leaderboard} />
          <MobileInsights insights={insights} />
          <MobileUpgrade />
          <MobileRecentActivity activities={activities} />
          <MobileRequestChange
            onRequestChange={() => setShowChangeModal(true)}
          />
        </div>

        {/* Desktop / tablet layout (unchanged) */}
        <div className="hidden md:grid max-w-7xl mx-auto lg:grid-cols-12 gap-8 items-start">
          <motion.div variants={cardVariants} className="lg:col-span-9 space-y-8 min-w-0">
            <CircleHero
              circle={circle}
              onHowItWorks={() => setShowHowItWorks(true)}
            />

            <AccountabilityRow circle={circle} currentUserId={user?.id} />

            <PerformanceSection circle={circle} />

            <FeedSection
              circleId={circle.id}
              feed={feed}
              onFeedUpdated={refreshFeed}
            />
          </motion.div>

          <motion.div variants={cardVariants} className="lg:col-span-3">
            <CircleSidebar
              insights={insights}
              circle={circle}
              activities={activities}
              leaderboard={leaderboard}
              onRequestChange={() => setShowChangeModal(true)}
            />
          </motion.div>
        </div>
      </motion.div>
    );
  };

  // FIX: Wrapped in the Global Layout architecture
  return (
    <div className="h-screen overflow-hidden font-(family-name:--font-inter) bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
      <div className="flex h-full">
        {/* MOBILE SIDEBAR MOBILE WRAPPER */}
        <div
          className={`fixed inset-0 z-50 xl:hidden transition-all duration-300 ${mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
            }`}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[260px] transform bg-[#0A0A0A] border-r border-zinc-900 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        <Sidebar onNavigate={() => setMobileOpen(false)} />

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar bg-[#070b0a]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
