"use client";

import { useState, useEffect } from "react";
import * as api from "../services/executioncircle.service";
import { LeaderboardEntry } from "@/types/executioncircle.types";
import Sidebar from "../components/layout/Sidebar";
import { Crown, Flame, Target, Menu } from "lucide-react";

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
    <div className="h-full w-full flex items-center justify-center font-bold text-zinc-400 bg-zinc-800">
      {name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  );
}

const RANK_COLORS: Record<string, string> = {
  diamond: "text-cyan-400",
  gold: "text-yellow-400",
  silver: "text-zinc-300",
  bronze: "text-amber-600",
};

const CROWN_COLORS = [
  "text-yellow-400", // 1st
  "text-gray-300", // 2nd
  "text-amber-700", // 3rd
];

// Podium styling per place — gold/silver/bronze ring + crown treatment
const PODIUM_STYLE = [
  {
    ring: "ring-yellow-200/90",
    crown: "text-yellow-400",
    label: "text-yellow-400",
    pedestal: "h-20",
    size: "h-24 w-24",
    order: "order-2",
  },
  {
    ring: "ring-zinc-300/50",
    crown: "text-zinc-300",
    label: "text-zinc-200",
    pedestal: "h-12",
    size: "h-20 w-20",
    order: "order-1",
  },
  {
    ring: "ring-amber-600/50",
    crown: "text-amber-600",
    label: "text-amber-500",
    pedestal: "h-8",
    size: "h-20 w-20",
    order: "order-3",
  },
];

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false); // FIX: Mobile sidebar state

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
          <div className="text-[#6b7280] text-sm">Loading leaderboard...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400 text-sm">Error: {error}</div>
        </div>
      );
    }

    const podium = leaders.slice(0, 3);
    const rest = leaders.slice(3);

    return (
      <div className="flex-1 p-4 md:p-8 text-[#e8e2d9]">
        {/* Mobile Header Toggle */}
        <div className="xl:hidden flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Leaderboard
          </h1>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="hidden xl:flex text-3xl font-bold mb-8 items-center gap-3">
            <Crown className="text-[#c4a27a]" size={32} /> Circle Leaderboard
          </h1>

          {leaders.length === 0 ? (
            <div className="bg-[#121820] border border-[#171d24] rounded-2xl p-12 text-center text-[#6b7280]">
              No members found. Complete tasks to appear here.
            </div>
          ) : (
            <>
              {/* PODIUM — top 3 */}
              {podium.length > 0 && (
                <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10 px-2">
                  {podium.map((l, i) => {
                    const style = PODIUM_STYLE[i];
                    const rankColor =
                      RANK_COLORS[
                        l.member.circle_rank?.toLowerCase() ?? "bronze"
                      ] ?? "text-amber-600";
                    return (
                      <div
                        key={l.member.id}
                        className={`flex flex-col items-center ${style.order} flex-1 max-w-[140px]`}
                      >
                        {/* Crown / medal */}
                        <img
                          src="/crown.svg"
                          alt="Crown"
                          className={`z-10 h-8 w-8 ${CROWN_COLORS[i]}`}
                        />

                        {/* Avatar */}
                        <div
                          className={`relative rounded-full ${style.size} ring-4 ${style.ring} overflow-hidden shrink-0`}
                        >
                          <Avatar
                            url={l.member.profile?.avatar_url}
                            name={l.member.profile?.full_name}
                          />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#0d1117] border border-zinc-700 flex items-center justify-center text-[11px] font-bold text-white">
                            {i + 1}
                          </div>
                        </div>

                        {/* Name + points pedestal */}
                        <div
                          className={`mt-3 w-full ${style.pedestal} flex flex-col items-center justify-start pt-2 px-2 bg-[#121820] border border-[#171d24] rounded-t-xl rounded-b-md`}
                        >
                          <p className="font-semibold text-sm text-center truncate w-full">
                            {l.member.profile?.full_name || "Anonymous"}
                          </p>
                          <p className={`text-xs font-bold ${rankColor}`}>
                            {l.points} pts
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LIST — rank 4 onward */}
              {rest.length > 0 && (
                <div className="bg-[#121820] border border-[#171d24] rounded-2xl overflow-hidden">
                  {rest.map((l, i) => {
                    const rank = i + 4;
                    const rankColor =
                      RANK_COLORS[
                        l.member.circle_rank?.toLowerCase() ?? "bronze"
                      ] ?? "text-amber-600";
                    return (
                      <div
                        key={l.member.id}
                        className="flex items-center justify-between gap-4 p-4 border-b border-[#171d24] last:border-b-0 hover:bg-[#c4a27a0a] transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className="text-sm font-semibold w-6 text-[#6b7280] shrink-0">
                            {rank}
                          </span>
                          <div className="h-9 w-9 rounded-full overflow-hidden border border-[#171d24] shrink-0">
                            <Avatar
                              url={l.member.profile?.avatar_url}
                              name={l.member.profile?.full_name}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#e8e2d9] truncate">
                              {l.member.profile?.full_name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-2">
                              <p
                                className={`text-[10px] font-bold ${rankColor}`}
                              >
                                {l.member.circle_rank?.toUpperCase() ??
                                  "BRONZE"}
                              </p>
                              {l.member.accountability_score != null && (
                                <p className="text-[10px] text-zinc-600">
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
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1 justify-end">
                              <Flame size={11} /> Streak
                            </p>
                            <p className="font-bold text-sm">
                              {l.member.streak_days}d
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] text-zinc-500 flex items-center gap-1 justify-end">
                              <Target size={11} /> Points
                            </p>
                            <p className="font-bold text-sm text-[#c4a27a]">
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
    <div className="min-h-screen bg-[#070b0a] flex antialiased selection:bg-white selection:text-black">
      {/* MOBILE SIDEBAR WRAPPER */}
      <div
        className={`fixed inset-0 z-50 xl:hidden transition-all duration-300 ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[260px] transform bg-[#0A0A0A] border-r border-zinc-900 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* DESKTOP SIDEBAR */}
      <Sidebar onNavigate={() => setMobileOpen(false)} />

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 bg-[#070b0a] flex flex-col">
        {renderContent()}
      </main>
    </div>
  );
}
