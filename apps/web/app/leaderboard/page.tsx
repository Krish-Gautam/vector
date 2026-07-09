"use client";

import { useState, useEffect } from "react";
import * as api from "../services/executioncircle.service";
import { LeaderboardEntry } from "@/types/executioncircle.types";
import Sidebar from "../components/layout/Sidebar";
import {Crown, Flame, Target, Menu, Medal } from "lucide-react";
function Avatar({
  url,
  name,
}: {
  url: string | null | undefined;
  name: string | null | undefined;
}) {
  if (url)
    return (
      <img src={url} alt={name || ""} className="h-full w-full object-cover" />
    );
  return (
    <div className="h-full w-full flex items-center justify-center font-bold text-white/40 bg-white/5">
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

// Grayscale-only differentiation — brighter/larger = higher rank
const PODIUM_STYLE = [
  {
    ring: "ring-white/80",
    glow: "shadow-[0_0_40px_-8px_rgba(255,255,255,0.35)]",
    crown: "text-white",
    label: "text-white",
    pedestal: "h-28",
    size: "h-24 w-24 sm:h-28 sm:w-28",
    order: "order-2",
    badgeBg: "bg-white text-black",
  },
  {
    ring: "ring-white/35",
    glow: "shadow-[0_0_24px_-8px_rgba(255,255,255,0.15)]",
    crown: "text-white/60",
    label: "text-white/70",
    pedestal: "h-20",
    size: "h-20 w-20 sm:h-22 sm:w-22",
    order: "order-1",
    badgeBg: "bg-white/15 text-white",
  },
  {
    ring: "ring-white/20",
    glow: "shadow-[0_0_16px_-8px_rgba(255,255,255,0.1)]",
    crown: "text-white/40",
    label: "text-white/50",
    pedestal: "h-14",
    size: "h-20 w-20 sm:h-22 sm:w-22",
    order: "order-3",
    badgeBg: "bg-white/10 text-white/80",
  },
];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const CROWN_ICON = [
    "/crown-gold.svg",
    "/crown-silver.svg",
    "/crown-bronze.svg",
  ];

  useEffect(() => {
    async function load() {
      try {
        const circle = await api.getMyCircle();
        if (circle) {
          const data = await api.getLeaderboard(circle.id);
          setLeaders(data);
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-white/40 text-xs font-mono uppercase tracking-widest">
            <div className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
            Loading leaderboard
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white/50 text-sm font-mono">Error: {error}</div>
        </div>
      );
    }

    const podium = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
      <div className="flex-1 p-4 md:p-8 text-white">
        {/* Mobile Header Toggle */}
        <div className="xl:hidden flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="text-white/70" size={20} />
            Leaderboard
          </h1>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="hidden xl:block mb-10">
            <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
              <Crown className="text-white/70" size={28} />
              Circle Leaderboard
            </h1>
            <p className="text-xs font-mono uppercase tracking-widest text-white/30 mt-2 pl-10">
              Ranked by points this cycle
            </p>
          </div>

          {leaders.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-12 text-center text-white/40 font-mono text-sm uppercase tracking-widest">
              No members found — complete tasks to appear here
            </div>
          ) : (
            <>
              {/* PODIUM — top 3 */}
              {podium.length > 0 && (
                <div className="relative mb-12 px-2">
                  {/* subtle backdrop glow */}
                  <div className="pointer-events-none absolute inset-x-0 -top-10 h-64 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_70%)]" />

                  <div className="relative flex items-end justify-center gap-3 sm:gap-6">
                    {podium.map((l, i) => {
                      const style = PODIUM_STYLE[i];
                      return (
                        <div
                          key={l.member.id}
                          className={`flex flex-col items-center ${style.order} flex-1 max-w-[150px]`}
                        >
                          {/* Crown / medal */}
                          <img
                            src={CROWN_ICON[i]}
                            alt={`Rank ${i + 1}`}
                            className="z-10 h-8 w-8 "
                          />

                          {/* Avatar */}
                          <div
                            className={`relative rounded-full ${style.size} ring-2 ${style.ring} ${style.glow} overflow-hidden shrink-0 bg-black`}
                          >
                            <Avatar
                              url={l.member.profile?.avatar_url}
                              name={l.member.profile?.full_name}
                            />
                            <div
                              className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full ${style.badgeBg} border border-black flex items-center justify-center text-[11px] font-bold font-mono`}
                            >
                              {i + 1}
                            </div>
                          </div>

                          {/* Name + points pedestal */}
                          <div
                            className={`mt-3 w-full ${style.pedestal} flex flex-col items-center justify-start pt-3 px-2 bg-white/[0.03] border border-white/10 rounded-t-xl rounded-b-md backdrop-blur-sm`}
                          >
                            <p className="font-semibold text-sm text-center truncate w-full">
                              {l.member.profile?.full_name || "Anonymous"}
                            </p>
                            <p
                              className={`text-xs font-bold font-mono mt-0.5 ${style.label}`}
                            >
                              {l.points} PTS
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* LIST — rank 4 onward */}
              {rest.length > 0 && (
                <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
                  {rest.map((l, i) => {
                    const rank = i + 4;
                    return (
                      <div
                        key={l.member.id}
                        className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-sm font-mono font-semibold w-6 text-white/30 shrink-0 text-center">
                            {rank}
                          </span>
                          <div className="h-9 w-9 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <Avatar
                              url={l.member.profile?.avatar_url}
                              name={l.member.profile?.full_name}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-white truncate">
                              {l.member.profile?.full_name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] font-bold font-mono uppercase tracking-wider text-white/40">
                                {l.member.circle_rank?.toUpperCase() ??
                                  "MEMBER"}
                              </p>
                              {l.member.accountability_score != null && (
                                <p className="text-[10px] font-mono text-white/25">
                                  Acc.{" "}
                                  {Math.round(
                                    Number(l.member.accountability_score),
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-5 text-right shrink-0">
                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-white/30 flex items-center gap-1 justify-end">
                              <Flame size={11} /> Streak
                            </p>
                            <p className="font-bold text-sm font-mono">
                              {l.member.streak_days}d
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-white/30 flex items-center gap-1 justify-end">
                              <Target size={11} /> Points
                            </p>
                            <p className="font-bold text-sm font-mono text-white">
                              {l.points}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black flex antialiased selection:bg-white selection:text-black relative">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Radial gradient wash */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* MOBILE SIDEBAR WRAPPER */}
      <div
        className={`fixed inset-0 z-50 xl:hidden transition-all duration-300 ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[260px] transform bg-black border-r border-white/10 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <Sidebar onNavigate={() => setMobileOpen(false)} />

      {/* MAIN CONTENT */}
      <main className="relative flex-1 min-w-0 flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}
