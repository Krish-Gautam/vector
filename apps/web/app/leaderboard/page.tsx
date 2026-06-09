// 'use client';
// import { useState, useEffect } from 'react';
// import * as api from '../services/executioncircle.service';
// import { LeaderboardEntry } from '@/types/executioncircle.types';
// import { Award, Flame, Target } from 'lucide-react';

// export default function LeaderboardPage() {
//   const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  
//   useEffect(() => {
//     async function load() {
//       const circle = await api.getMyCircle();
//       if (circle) {
//         const data = await api.getLeaderboard(circle.id);
//         setLeaders(data);
//       }
//     }
//     load();
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#0a0d11] p-8 text-[#e8e2d9]">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><Award className="text-[#c4a27a]" /> Circle Leaderboard</h1>
//         <div className="bg-[#121820] border border-[#171d24] rounded-2xl overflow-hidden">
//           {leaders.map((l, i) => (
//             <div key={l.member.id} className="flex items-center justify-between p-4 border-b border-[#171d24] hover:bg-[#c4a27a0a]">
//               <div className="flex items-center gap-4">
//                 <span className="text-xl font-bold text-[#c4a27a] w-8">#{i + 1}</span>
//                 <div className="h-10 w-10 bg-zinc-800 rounded-full overflow-hidden">
//                   {l.member.profile?.avatar_url ? <img src={l.member.profile.avatar_url} /> : <div className="h-full w-full flex items-center justify-center font-bold">{l.member.profile?.full_name?.charAt(0)}</div>}
//                 </div>
//                 <div>
//                   <p className="font-semibold">{l.member.profile?.full_name || 'Anonymous'}</p>
//                   <p className="text-xs text-zinc-500">Rank: {l.member.circle_rank?.toUpperCase()}</p>
//                 </div>
//               </div>
//               <div className="flex gap-8 text-right">
//                 <div><p className="text-xs text-zinc-500 flex items-center gap-1"><Flame size={12}/> Streak</p><p className="font-bold">{l.member.streak_days}d</p></div>
//                 <div><p className="text-xs text-zinc-500 flex items-center gap-1"><Target size={12}/> Score</p><p className="font-bold text-[#c4a27a]">{l.points}</p></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }









// 'use client';

// import { useState, useEffect } from 'react';
// import * as api from '../services/executioncircle.service';
// import { LeaderboardEntry } from '@/types/executioncircle.types';
// import { Award, Flame, Target, TrendingUp } from 'lucide-react';

// function Avatar({ url, name }: { url: string | null | undefined; name: string | null | undefined }) {
//   if (url) return <img src={url} alt={name || ''} className="h-full w-full object-cover" />;
//   return (
//     <div className="h-full w-full flex items-center justify-center font-bold text-zinc-400">
//       {name?.charAt(0)?.toUpperCase() || '?'}
//     </div>
//   );
// }

// const RANK_COLORS: Record<string, string> = {
//   diamond: 'text-cyan-400',
//   gold: 'text-yellow-400',
//   silver: 'text-zinc-300',
//   bronze: 'text-amber-600',
// };

// export default function LeaderboardPage() {
//   const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function load() {
//       try {
//         const circle = await api.getMyCircle();
//         if (circle) {
//           const data = await api.getLeaderboard(circle.id);
//           setLeaders(data);
//         }
//       } catch (e: any) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0a0d11] flex items-center justify-center">
//         <div className="text-[#6b7280] text-sm">Loading leaderboard...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-[#0a0d11] flex items-center justify-center">
//         <div className="text-red-400 text-sm">Error: {error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0a0d11] p-8 text-[#e8e2d9]">
//       <div className="max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
//           <Award className="text-[#c4a27a]" size={32} /> Circle Leaderboard
//         </h1>

//         {leaders.length === 0 ? (
//           <div className="bg-[#121820] border border-[#171d24] rounded-2xl p-12 text-center text-[#6b7280]">
//             No members found. Complete tasks to appear here.
//           </div>
//         ) : (
//           <div className="bg-[#121820] border border-[#171d24] rounded-2xl overflow-hidden">
//             {leaders.map((l, i) => {
//               const rankColor = RANK_COLORS[l.member.circle_rank?.toLowerCase() ?? 'bronze'] ?? 'text-amber-600';
//               return (
//                 <div
//                   key={l.member.id}
//                   className={`flex items-center justify-between p-4 border-b border-[#171d24] hover:bg-[#c4a27a0a] transition-colors ${i === 0 ? 'bg-[#c4a27a08]' : ''}`}
//                 >
//                   <div className="flex items-center gap-4">
//                     {/* Rank number with medal styling */}
//                     <span className={`text-xl font-bold w-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-600' : 'text-[#6b7280]'}`}>
//                       #{i + 1}
//                     </span>

//                     {/* FIXED: Avatar uses dedicated component — no double render */}
//                     <div className="h-10 w-10 bg-zinc-800 rounded-full overflow-hidden border border-[#171d24]">
//                       <Avatar url={l.member.profile?.avatar_url} name={l.member.profile?.full_name} />
//                     </div>

//                     <div>
//                       <p className="font-semibold text-[#e8e2d9]">{l.member.profile?.full_name || 'Anonymous'}</p>
//                       <div className="flex items-center gap-2">
//                         <p className={`text-xs font-bold ${rankColor}`}>
//                           {l.member.circle_rank?.toUpperCase() ?? 'BRONZE'}
//                         </p>
//                         {l.member.accountability_score != null && (
//                           <p className="text-[10px] text-zinc-600">
//                             Acc. {Math.round(Number(l.member.accountability_score))}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex gap-6 text-right">
//                     <div>
//                       <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
//                         <Flame size={12} /> Streak
//                       </p>
//                       <p className="font-bold text-sm">{l.member.streak_days}d</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
//                         <TrendingUp size={12} /> Weekly
//                       </p>
//                       <p className="font-bold text-sm">{l.member.weekly_completion ?? 0}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
//                         <Target size={12} /> Points
//                       </p>
//                       <p className="font-bold text-sm text-[#c4a27a]">{l.points}</p>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }














'use client';

import { useState, useEffect } from 'react';
import * as api from '../services/executioncircle.service';
import { LeaderboardEntry } from '@/types/executioncircle.types';
import Sidebar from '../components/Sidebar';
import { Award, Flame, Target, TrendingUp, Menu } from 'lucide-react';

function Avatar({ url, name }: { url: string | null | undefined; name: string | null | undefined }) {
  if (url) return <img src={url} alt={name || ''} className="h-full w-full object-cover" />;
  return (
    <div className="h-full w-full flex items-center justify-center font-bold text-zinc-400">
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

const RANK_COLORS: Record<string, string> = {
  diamond: 'text-cyan-400',
  gold: 'text-yellow-400',
  silver: 'text-zinc-300',
  bronze: 'text-amber-600',
};

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

    return (
      <div className="flex-1 p-4 md:p-8 text-[#e8e2d9]">
        {/* Mobile Header Toggle */}
        <div className="xl:hidden flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">Leaderboard</h1>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="hidden xl:flex text-3xl font-bold mb-8 items-center gap-3">
            <Award className="text-[#c4a27a]" size={32} /> Circle Leaderboard
          </h1>

          {leaders.length === 0 ? (
            <div className="bg-[#121820] border border-[#171d24] rounded-2xl p-12 text-center text-[#6b7280]">
              No members found. Complete tasks to appear here.
            </div>
          ) : (
            <div className="bg-[#121820] border border-[#171d24] rounded-2xl overflow-hidden">
              {leaders.map((l, i) => {
                const rankColor = RANK_COLORS[l.member.circle_rank?.toLowerCase() ?? 'bronze'] ?? 'text-amber-600';
                return (
                  <div
                    key={l.member.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-[#171d24] hover:bg-[#c4a27a0a] transition-colors ${i === 0 ? 'bg-[#c4a27a08]' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-xl font-bold w-8 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-600' : 'text-[#6b7280]'}`}>
                        #{i + 1}
                      </span>
                      <div className="h-10 w-10 bg-zinc-800 rounded-full overflow-hidden border border-[#171d24] shrink-0">
                        <Avatar url={l.member.profile?.avatar_url} name={l.member.profile?.full_name} />
                      </div>
                      <div>
                        <p className="font-semibold text-[#e8e2d9]">{l.member.profile?.full_name || 'Anonymous'}</p>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${rankColor}`}>
                            {l.member.circle_rank?.toUpperCase() ?? 'BRONZE'}
                          </p>
                          {l.member.accountability_score != null && (
                            <p className="text-[10px] text-zinc-600">
                              Acc. {Math.round(Number(l.member.accountability_score))}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-6 text-right w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t border-zinc-800 sm:border-0 mt-2 sm:mt-0">
                      <div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                          <Flame size={12} /> Streak
                        </p>
                        <p className="font-bold text-sm">{l.member.streak_days}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                          <TrendingUp size={12} /> Weekly
                        </p>
                        <p className="font-bold text-sm">{l.member.weekly_completion ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 justify-end">
                          <Target size={12} /> Points
                        </p>
                        <p className="font-bold text-sm text-[#c4a27a]">{l.points}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b0a] flex antialiased selection:bg-white selection:text-black">
      {/* MOBILE SIDEBAR WRAPPER */}
      <div className={`fixed inset-0 z-50 xl:hidden transition-all duration-300 ${mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileOpen(false)} />
        <div className={`absolute left-0 top-0 h-full w-[260px] transform bg-[#0A0A0A] border-r border-zinc-900 transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
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