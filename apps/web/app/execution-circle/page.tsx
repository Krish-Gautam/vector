
























// 'use client';

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   CircleDetail,
//   CirclePostWithAuthor,
//   LeaderboardEntry,
//   CircleInsights,
//   CircleMemberWithProfile,
// } from '@/types/executioncircle.types';
// import * as api from '../services/executioncircle.service';
// import {
//   TrendingUp,
//   Zap,
//   Target,
//   Flame,
//   Plus,
//   Activity,
//   Award,
//   ArrowRight,
//   X,
// } from 'lucide-react';

// // ── Design System Constants ────────────────────────────────────────
// const COLORS = {
//   bg: 'bg-[#0a0d11]',
//   surface: 'bg-[#0f1318]',
//   card: 'bg-[#121820]',
//   border: 'border-[#171d24]',
//   accent: 'text-[#c4a27a]',
//   accentBg: 'bg-[#c4a27a]',
//   accentBorder: 'border-[#c4a27a]',
//   text: 'text-[#e8e2d9]',
//   textMuted: 'text-[#6b7280]',
// };

// // ── Sub-Components ────────────────────────────────────────────────

// const Card = ({
//   children,
//   className = '',
// }: {
//   children: React.ReactNode;
//   className?: string;
// }) => (
//   <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl ${className}`}>
//     {children}
//   </div>
// );

// const Badge = ({
//   children,
//   variant = 'accent',
// }: {
//   children: React.ReactNode;
//   variant?: 'accent' | 'success';
// }) => (
//   <span
//     className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
//       variant === 'accent'
//         ? 'bg-[#c4a27a22] text-[#c4a27a]'
//         : 'bg-green-500/10 text-green-500'
//     }`}
//   >
//     {children}
//   </span>
// );

// const Skeleton = ({ className = 'h-4 w-full' }: { className?: string }) => (
//   <div className={`${className} animate-pulse rounded-md bg-[#171d24]`} />
// );

// // ── How It Works Modal ─────────────────────────────────────────────

// function HowItWorksModal({ onClose }: { onClose: () => void }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl max-w-md w-full p-6`}>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className={`${COLORS.text} font-bold text-lg`}>How Execution Circles Work</h2>
//           <button onClick={onClose} className={`${COLORS.textMuted} hover:text-white`}>
//             <X size={18} />
//           </button>
//         </div>
//         <div className="space-y-4">
//           {[
//             {
//               step: '1',
//               title: 'Matched by Goal & Level',
//               desc: 'You are grouped with peers who share your goal, timeline, and current skill level.',
//             },
//             {
//               step: '2',
//               title: 'Weekly Rematching',
//               desc: 'Every week circles are reshuffled based on accountability scores so you always train with peers at your level.',
//             },
//             {
//               step: '3',
//               title: 'Score by Action',
//               desc: 'Completing daily tasks (+2 pts), uploading proofs (+3 pts), and finishing weekly challenges (+50 pts) all raise your score.',
//             },
//             {
//               step: '4',
//               title: 'Rank Up',
//               desc: 'Score 90+ to reach Diamond rank. Your rank determines which circle you are placed in next cycle.',
//             },
//           ].map((item) => (
//             <div key={item.step} className="flex gap-3">
//               <div className="h-7 w-7 rounded-full bg-[#c4a27a22] text-[#c4a27a] font-bold text-sm flex items-center justify-center shrink-0">
//                 {item.step}
//               </div>
//               <div>
//                 <p className={`${COLORS.text} text-sm font-semibold`}>{item.title}</p>
//                 <p className={`${COLORS.textMuted} text-xs`}>{item.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//         <button
//           onClick={onClose}
//           className={`mt-6 w-full py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm`}
//         >
//           Got it
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Request Change Modal ───────────────────────────────────────────

// function RequestChangeModal({
//   circleId,
//   onClose,
// }: {
//   circleId: string;
//   onClose: () => void;
// }) {
//   const [reason, setReason] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [done, setDone] = useState(false);

//   const handleSubmit = async () => {
//     if (!reason.trim()) return;
//     setSubmitting(true);
//     try {
//       await api.requestChange(circleId, reason);
//       setDone(true);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl max-w-md w-full p-6`}>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className={`${COLORS.text} font-bold text-lg`}>Request Circle Change</h2>
//           <button onClick={onClose} className={`${COLORS.textMuted} hover:text-white`}>
//             <X size={18} />
//           </button>
//         </div>
//         {done ? (
//           <div className="text-center py-6">
//             <p className="text-green-500 font-bold text-lg mb-2">Request Submitted!</p>
//             <p className={`${COLORS.textMuted} text-sm`}>
//               Our team will review your request and process it within 24–48 hours.
//             </p>
//             <button
//               onClick={onClose}
//               className={`mt-6 px-6 py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm`}
//             >
//               Close
//             </button>
//           </div>
//         ) : (
//           <>
//             <p className={`${COLORS.textMuted} text-sm mb-4`}>
//               Tell us why you would like to be placed in a different circle.
//             </p>
//             <textarea
//               className={`w-full bg-[#0f1318] border ${COLORS.border} rounded-xl p-3 text-sm outline-none ${COLORS.text} h-28 resize-none`}
//               placeholder="e.g. The circle is not active enough, I want to be matched with more serious peers..."
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//             />
//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={onClose}
//                 className={`flex-1 py-2 border ${COLORS.border} rounded-xl text-sm font-medium ${COLORS.textMuted}`}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSubmit}
//                 disabled={submitting || !reason.trim()}
//                 className={`flex-1 py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm disabled:opacity-50`}
//               >
//                 {submitting ? 'Submitting...' : 'Submit Request'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Section A: Hero Section ────────────────────────────────────────

// function CircleHero({
//   circle,
//   onHowItWorks,
// }: {
//   circle: CircleDetail;
//   onHowItWorks: () => void;
// }) {
//   return (
//     <div className="mb-8">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
//         <div>
//           <h1 className={`text-2xl font-bold ${COLORS.text} mb-1`}>{circle.name}</h1>
//           <p className={`${COLORS.textMuted} text-sm`}>
//             You're matched with {circle.member_count} focused peers on a similar journey.
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="p-4 flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-[#c4a27a11] flex items-center justify-center border border-[#c4a27a33]">
//             <Target className={COLORS.accent} size={24} />
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Your Circle</p>
//             <div className="flex items-center gap-2">
//               <span className={COLORS.text + ' font-bold'}>{circle.name}</span>
//               <Badge>Active</Badge>
//             </div>
//           </div>
//         </Card>

//         <Card className="p-4 flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
//             <Award className="text-yellow-500" size={24} />
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Circle Rank</p>
//             <div className="flex items-center gap-2">
//               <span className={COLORS.text + ' font-bold'}>
//                 {circle.current_level.toUpperCase()}
//               </span>
//               <span className="text-[10px] text-zinc-500">Top 28% circles</span>
//             </div>
//           </div>
//         </Card>

//         <Card className="p-4 flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
//             <TrendingUp className="text-green-500" size={24} />
//           </div>
//           <div className="flex-1">
//             <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>
//               Accountability Score
//             </p>
//             <div className="flex items-center justify-between">
//               <span className="text-green-500 font-bold text-lg">{circle.health_score}%</span>
//               <div className="flex gap-1 items-end h-4">
//                 {[4, 7, 5, 8, 6, 9, 12].map((h, i) => (
//                   <div
//                     key={i}
//                     style={{ height: `${h}px` }}
//                     className="w-1 bg-green-500/40 rounded-full"
//                   />
//                 ))}
//               </div>
//             </div>
//           </div>
//         </Card>
//       </div>

//       <div
//         className={`mt-4 p-3 rounded-xl border ${COLORS.border} ${COLORS.surface} flex items-center justify-between text-xs ${COLORS.textMuted}`}
//       >
//         <div className="flex items-center gap-2">
//           <Zap size={14} className={COLORS.accent} />
//           <span>Matched based on your goal, timeline, consistency, and execution pace.</span>
//         </div>
//         <button
//           onClick={onHowItWorks}
//           className={COLORS.accent + ' font-medium hover:underline'}
//         >
//           How it works?
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Section B: Accountability Circle Row ───────────────────────────

// function AccountabilityRow({ circle }: { circle: CircleDetail }) {
//   return (
//     <div className="mb-8">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className={`${COLORS.text} font-semibold flex items-center gap-2`}>
//           Your Accountability Circle{' '}
//           <div className="h-1 w-1 rounded-full bg-zinc-600" />
//         </h2>
//         <p className={`${COLORS.textMuted} text-xs`}>Circle refreshes in 6 days</p>
//       </div>

//       <div className="flex overflow-x-auto gap-8 pb-4 no-scrollbar">
//         {circle.members.map((member, idx) => (
//           <div key={member.id} className="flex flex-col items-center gap-3 min-w-[80px]">
//             <div className="relative">
//               <div className="h-20 w-20 rounded-full border-2 border-[#171d24] overflow-hidden bg-zinc-900">
//                 {member.profile?.avatar_url ? (
//                   <img
//                     src={member.profile.avatar_url}
//                     alt=""
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-xl font-bold text-zinc-700">
//                     {member.profile?.full_name?.charAt(0) || '?'}
//                   </div>
//                 )}
//               </div>
//               {idx === 0 && (
//                 <div className="absolute -bottom-1 -right-1 bg-[#c4a27a] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
//                   YOU
//                 </div>
//               )}
//             </div>
//             <div className="text-center">
//               <p className={`${COLORS.text} text-sm font-medium truncate w-20`}>
//                 {member.profile?.full_name || 'Unknown'}
//               </p>
//               <p className={`${COLORS.textMuted} text-[11px]`}>
//                 Consistency {(member as any).weekly_completion || 0}%
//               </p>
//             </div>
//           </div>
//         ))}
//         <button
//           className={`h-20 w-20 rounded-full border-2 border-dashed ${COLORS.border} flex items-center justify-center ${COLORS.textMuted} hover:border-[#c4a27a] hover:text-[#c4a27a] transition-colors`}
//         >
//           <Plus size={24} />
//         </button>
//       </div>

//       <div
//         className={`mt-6 p-4 rounded-2xl ${COLORS.surface} ${COLORS.border} border grid grid-cols-1 md:grid-cols-3 gap-4`}
//       >
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center text-[#c4a27a]">
//             🎯
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Circle Focus</p>
//             <p className={`${COLORS.text} text-sm font-medium`}>{circle.goal}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 border-l border-[#171d24] pl-4">
//           <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center text-[#c4a27a]">
//             🏆
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Duration</p>
//             <p className={`${COLORS.text} text-sm font-medium`}>{circle.duration_months} Months</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 border-l border-[#171d24] pl-4">
//           <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center text-[#c4a27a]">
//             📅
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Members</p>
//             <p className={`${COLORS.text} text-sm font-medium`}>{circle.member_count} Active</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Section C: Performance Section ──────────────────────────────────

// function PerformanceSection({ circle }: { circle: CircleDetail }) {
//   const metrics = [
//     {
//       label: 'Avg. Progress',
//       value: `${circle.health_score}%`,
//       trend: '+8% this week',
//       icon: <Target size={16} />,
//     },
//     {
//       label: 'Avg. Consistency',
//       value: '82%',
//       trend: '+6% this week',
//       icon: <Zap size={16} />,
//     },
//     {
//       label: 'Tasks Completed',
//       value: `${circle.weekly_activity_count}`,
//       trend: '+18 this week',
//       icon: <Activity size={16} />,
//     },
//     {
//       label: 'Streak',
//       value: '14 Days',
//       trend: 'Best: 21 Days',
//       icon: <Flame size={16} />,
//     },
//     {
//       label: 'Overall Trend',
//       value: 'On Track',
//       trend: 'Great momentum!',
//       icon: <TrendingUp size={16} />,
//     },
//   ];

//   return (
//     <div className="mb-8">
//       <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Performance</h2>
//       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
//         {metrics.map((m, i) => (
//           <Card key={i} className="p-4">
//             <div className="flex items-center gap-2 text-zinc-500 mb-3">
//               {m.icon}
//               <span className="text-[11px] font-medium uppercase tracking-tight">{m.label}</span>
//             </div>
//             <div className={`${COLORS.text} text-xl font-bold mb-1`}>{m.value}</div>
//             <div className="text-green-500 text-[10px] font-medium">{m.trend}</div>
//           </Card>
//         ))}
//       </div>

//       <div
//         className={`mt-6 p-4 rounded-2xl ${COLORS.surface} ${COLORS.border} border flex justify-between items-center`}
//       >
//         <p className={`${COLORS.text} text-sm`}>
//           Keep going! Your consistency is inspiring your circle.{' '}
//           <span className={`${COLORS.textMuted} ml-2`}>
//             You're doing better than 73% of Vector users.
//           </span>
//         </p>
//         <button
//           className={`flex items-center gap-1 text-xs font-bold ${COLORS.accent} hover:underline`}
//         >
//           View Leaderboard <ArrowRight size={14} />
//         </button>
//       </div>
//     </div>
//   );
// }

// // ── Section D: Feed Section ────────────────────────────────────────

// function FeedSection({
//   circleId,
//   feed,
//   onPostCreated,
// }: {
//   circleId: string;
//   feed: CirclePostWithAuthor[];
//   onPostCreated: () => void;
// }) {
//   const [content, setContent] = useState('');
//   const [proofUrl, setProofUrl] = useState('');
//   const [posting, setPosting] = useState(false);
//   const [cursor, setCursor] = useState<string | null>(null);
//   const [morePosts, setMorePosts] = useState<CirclePostWithAuthor[]>([]);
//   const [loadingMore, setLoadingMore] = useState(false);

//   const handlePost = async () => {
//     if (!content.trim() && !proofUrl.trim()) return;
//     setPosting(true);
//     try {
//       if (proofUrl.trim()) {
//         await api.uploadProof(circleId, proofUrl.trim(), content.trim());
//       } else {
//         await api.createPost({
//           circle_id: circleId,
//           content: content.trim(),
//           post_type: 'update',
//         });
//       }
//       setContent('');
//       setProofUrl('');
//       onPostCreated();
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setPosting(false);
//     }
//   };

//   const handleLoadMore = async () => {
//     if (!cursor) return;
//     setLoadingMore(true);
//     try {
//       const res = await api.getFeed(circleId, cursor);
//       setMorePosts((prev) => [...prev, ...res.posts]);
//       setCursor(res.cursor ?? null);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoadingMore(false);
//     }
//   };

//   // Set initial cursor from feed prop length
//   useEffect(() => {
//     if (feed.length > 0) {
//       setCursor(feed[feed.length - 1]?.created_at ?? null);
//     }
//   }, [feed]);

//   const allPosts = [...feed, ...morePosts];

//   return (
//     <div className="pt-8 border-t border-[#171d24]">
//       <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Feed</h2>

//       {/* Compose */}
//       <Card className="p-4 mb-6">
//         <textarea
//           className={`w-full bg-[#0f1318] border ${COLORS.border} rounded-xl p-3 text-sm outline-none ${COLORS.text} h-20 resize-none`}
//           placeholder="Share an update, win, or question with your circle..."
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Optional: Paste image URL for proof upload"
//           value={proofUrl}
//           onChange={(e) => setProofUrl(e.target.value)}
//           className={`w-full mt-2 bg-[#0f1318] border ${COLORS.border} rounded-lg p-2 text-xs ${COLORS.text} outline-none`}
//         />
//         <div className="flex justify-end mt-3">
//           <button
//             onClick={handlePost}
//             disabled={posting || (!content.trim() && !proofUrl.trim())}
//             className={`${COLORS.accentBg} text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50`}
//           >
//             {posting ? 'Posting...' : proofUrl.trim() ? '📸 Upload Proof' : 'Post'}
//           </button>
//         </div>
//       </Card>

//       {/* Posts */}
//       <div className="space-y-4">
//         {allPosts.map((post) => {
//           const isProof = post.content.includes('[IMAGE:');
//           const cleanContent = post.content.replace(/\[IMAGE:.*\]/, '').trim();
//           const imgMatch = post.content.match(/\[IMAGE:(.*?)\]/);

//           return (
//             <Card key={post.id} className="p-4">
//               <div className="flex gap-3 mb-3">
//                 <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm shrink-0">
//                   {post.author?.avatar_url ? (
//                     <img
//                       src={post.author.avatar_url}
//                       alt=""
//                       className="w-full h-full rounded-full object-cover"
//                     />
//                   ) : (
//                     post.author?.full_name?.charAt(0) || '?'
//                   )}
//                 </div>
//                 <div>
//                   <span className={`${COLORS.text} font-semibold text-sm`}>
//                     {post.author?.full_name || 'Unknown'}
//                   </span>
//                   <p className={`${COLORS.textMuted} text-[11px]`}>
//                     {new Date(post.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
//               {cleanContent && (
//                 <p className={`text-sm mb-3 whitespace-pre-wrap ${COLORS.text}`}>
//                   {cleanContent}
//                 </p>
//               )}
//               {isProof && imgMatch && (
//                 <img
//                   src={imgMatch[1]}
//                   alt="Proof"
//                   className="rounded-lg max-h-64 object-cover mb-3 w-full"
//                 />
//               )}
//               <div className={`flex items-center gap-4 border-t ${COLORS.border} pt-3`}>
//                 <button
//                   onClick={() => api.toggleLike(post.id)}
//                   className={`text-xs ${COLORS.textMuted} hover:text-[#c4a27a] transition-colors`}
//                 >
//                   ❤️ {post.likes_count}
//                 </button>
//                 <span className={`text-xs ${COLORS.textMuted}`}>
//                   💬 {post.comments_count}
//                 </span>
//               </div>
//             </Card>
//           );
//         })}
//       </div>

//       {cursor && (
//         <button
//           onClick={handleLoadMore}
//           disabled={loadingMore}
//           className={`w-full mt-4 py-2 border ${COLORS.border} rounded-xl text-xs font-bold ${COLORS.textMuted} hover:text-[#c4a27a] disabled:opacity-50`}
//         >
//           {loadingMore ? 'Loading...' : 'Load More'}
//         </button>
//       )}
//     </div>
//   );
// }

// // ── Section E: Right Sidebar ───────────────────────────────────────

// function CircleSidebar({
//   insights,
//   circle,
//   onRequestChange,
// }: {
//   insights: CircleInsights | null;
//   circle: CircleDetail;
//   onRequestChange: () => void;
// }) {
//   return (
//     <div className="space-y-6">
//       {/* Insights Card */}
//       <Card className="p-5">
//         <h3 className={`${COLORS.text} font-semibold mb-4 flex items-center gap-2`}>
//           <Activity size={16} className={COLORS.accent} /> Circle Insights
//         </h3>
//         {insights ? (
//           <div className="space-y-4">
//             <div className="flex justify-between items-end">
//               <p className={`${COLORS.textMuted} text-xs`}>Your circle is performing</p>
//               <p className="text-green-500 font-bold text-sm">{insights.better_than}% better</p>
//             </div>
//             <p className={`${COLORS.textMuted} text-xs mb-2`}>than similar circles</p>
//             <div className="flex items-end justify-between h-16 gap-2">
//               {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
//                 <div
//                   key={i}
//                   className="flex-1 bg-[#171d24] rounded-t-sm relative cursor-pointer"
//                 >
//                   <div
//                     className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all ${
//                       i === 3 ? 'bg-[#c4a27a]' : 'bg-zinc-600'
//                     }`}
//                     style={{ height: `${h}%` }}
//                   />
//                 </div>
//               ))}
//             </div>
//             <div className="space-y-1 mt-2">
//               <div className="flex justify-between text-xs">
//                 <span className={COLORS.textMuted}>Avg Score</span>
//                 <span className={COLORS.text}>{insights.avg_score}</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span className={COLORS.textMuted}>Avg Streak</span>
//                 <span className={COLORS.text}>{insights.avg_streak}d</span>
//               </div>
//               <div className="flex justify-between text-xs">
//                 <span className={COLORS.textMuted}>Task Completion</span>
//                 <span className={COLORS.text}>{insights.avg_completion}%</span>
//               </div>
//             </div>
//             <p className={`${COLORS.text} text-xs text-center font-medium mt-2`}>
//               Keep up the amazing work!
//             </p>
//           </div>
//         ) : (
//           <Skeleton className="h-32" />
//         )}
//       </Card>

//       {/* Upgrade Card */}
//       <Card className="p-5">
//         <div className="flex items-center gap-2 mb-4">
//           <Award size={16} className="text-yellow-500" />
//           <h3 className={`${COLORS.text} font-semibold`}>Next Circle Upgrade</h3>
//         </div>
//         <p className={`${COLORS.textMuted} text-xs mb-4`}>
//           Maintain 90%+ consistency for 7 more days to unlock Diamond Circle
//         </p>
//         <div className="h-2 w-full bg-[#171d24] rounded-full overflow-hidden mb-2">
//           <div className="h-full bg-yellow-500" style={{ width: '43%' }} />
//         </div>
//         <p className={`${COLORS.textMuted} text-[10px] text-right`}>3/7 days</p>
//       </Card>

//       {/* Activity Card */}
//       <Card className="p-5">
//         <h3 className={`${COLORS.text} font-semibold mb-4`}>Recent Circle Activity</h3>
//         <div className="space-y-4">
//           {[
//             { user: 'Rohit S.', action: 'uploaded a proof', time: '2h ago' },
//             { user: 'Ananya P.', action: 'completed a task', time: '4h ago' },
//             { user: 'Vikram M.', action: 'reached a 15 day streak', time: '6h ago' },
//             { user: 'Sneha K.', action: 'joined the circle', time: '1d ago' },
//           ].map((act, i) => (
//             <div key={i} className="flex justify-between items-start gap-2">
//               <div>
//                 <span className={`${COLORS.text} text-xs font-medium`}>{act.user}</span>
//                 <span className={`${COLORS.textMuted} text-xs ml-1`}>{act.action}</span>
//               </div>
//               <span className="text-[10px] text-zinc-600">{act.time}</span>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* Request Change */}
//       <Card className="p-5 text-center">
//         <h3 className={`${COLORS.text} font-semibold mb-2 text-sm`}>Need a Change?</h3>
//         <p className={`${COLORS.textMuted} text-xs mb-4`}>
//           Not feeling the right match? Request a circle change.
//         </p>
//         <button
//           onClick={onRequestChange}
//           className={`w-full py-2 rounded-xl border ${COLORS.border} ${COLORS.text} text-xs font-medium hover:bg-white/5 transition-colors`}
//         >
//           Request Change
//         </button>
//       </Card>
//     </div>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────────────

// export default function ExecutionCirclePage() {
//   const [circle, setCircle] = useState<CircleDetail | null>(null);
//   const [feed, setFeed] = useState<CirclePostWithAuthor[]>([]);
//   const [insights, setInsights] = useState<CircleInsights | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isJoining, setIsJoining] = useState(false);
//   const [showHowItWorks, setShowHowItWorks] = useState(false);
//   const [showChangeModal, setShowChangeModal] = useState(false);

//   const loadData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const circleData = await api.getMyCircle();
//       setCircle(circleData);

//       const [feedData, insightsData] = await Promise.all([
//         api.getFeed(circleData.id),
//         api.getInsights(circleData.id),
//       ]);

//       setFeed(feedData.posts);
//       setInsights(insightsData as CircleInsights);
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadData();
//   }, [loadData]);

//   const handleManualJoin = async () => {
//     try {
//       setIsJoining(true);
//       await api.createOrJoinCircle({
//         goal: 'Build a SaaS product',
//         duration_months: 6,
//         current_level: 'intermediate',
//       });
//       await loadData();
//     } catch (e: any) {
//       console.error(e);
//     } finally {
//       setIsJoining(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div
//         className={`min-h-screen ${COLORS.bg} p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8`}
//       >
//         <div className="col-span-9 space-y-8">
//           <div className="space-y-4">
//             <Skeleton className="h-8 w-48" />
//             <div className="grid grid-cols-3 gap-4">
//               <Skeleton className="h-24" />
//               <Skeleton className="h-24" />
//               <Skeleton className="h-24" />
//             </div>
//           </div>
//           <Skeleton className="h-48" />
//           <Skeleton className="h-48" />
//         </div>
//         <div className="col-span-3 space-y-6">
//           <Skeleton className="h-48" />
//           <Skeleton className="h-32" />
//         </div>
//       </div>
//     );
//   }

//   if (error || !circle) {
//     return (
//       <div className={`min-h-screen ${COLORS.bg} flex items-center justify-center p-6`}>
//         <div
//           className={`${COLORS.card} ${COLORS.border} border p-12 rounded-3xl text-center max-w-md`}
//         >
//           <div className="h-20 w-20 bg-[#c4a27a22] rounded-full flex items-center justify-center mx-auto mb-6">
//             <Target className={COLORS.accent} size={40} />
//           </div>
//           <h2 className={`${COLORS.text} text-2xl font-bold mb-2`}>
//             Join Your First Execution Circle
//           </h2>
//           <p className={`${COLORS.textMuted} mb-8`}>
//             You haven't been matched with a circle yet. Let us find your ideal
//             high-performance peers.
//           </p>
//           <button
//             onClick={handleManualJoin}
//             disabled={isJoining}
//             className={`w-full py-3 ${COLORS.accentBg} text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50`}
//           >
//             {isJoining ? 'Matching...' : 'Find My Circle'}
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${COLORS.bg} text-[#e8e2d9] p-4 md:p-8`}>
//       {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
//       {showChangeModal && (
//         <RequestChangeModal
//           circleId={circle.id}
//           onClose={() => setShowChangeModal(false)}
//         />
//       )}

//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
//         <div className="lg:col-span-9 space-y-8">
//           <CircleHero circle={circle} onHowItWorks={() => setShowHowItWorks(true)} />
//           <AccountabilityRow circle={circle} />
//           <PerformanceSection circle={circle} />
//           <FeedSection
//             circleId={circle.id}
//             feed={feed}
//             onPostCreated={loadData}
//           />
//         </div>

//         <div className="lg:col-span-3">
//           <CircleSidebar
//             insights={insights}
//             circle={circle}
//             onRequestChange={() => setShowChangeModal(true)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }


















// 'use client';

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   CircleDetail,
//   CirclePostWithAuthor,
//   CircleCommentWithAuthor,
//   LeaderboardEntry,
//   CircleInsights,
//   CircleActivityWithProfile,
// } from '@/types/executioncircle.types';
// import * as api from '../services/executioncircle.service';
// import {
//   TrendingUp,
//   Zap,
//   Target,
//   Flame,
//   Plus,
//   Activity,
//   Award,
//   ArrowRight,
//   X,
//   Heart,
//   MessageCircle,
//   Send,
//   ChevronDown,
// } from 'lucide-react';

// // ── Design System ──────────────────────────────────────────
// const COLORS = {
//   bg: 'bg-[#0a0d11]',
//   surface: 'bg-[#0f1318]',
//   card: 'bg-[#121820]',
//   border: 'border-[#171d24]',
//   accent: 'text-[#c4a27a]',
//   accentBg: 'bg-[#c4a27a]',
//   text: 'text-[#e8e2d9]',
//   textMuted: 'text-[#6b7280]',
// };

// const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
//   <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl ${className}`}>{children}</div>
// );

// const Badge = ({ children, variant = 'accent' }: { children: React.ReactNode; variant?: 'accent' | 'success' }) => (
//   <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variant === 'accent' ? 'bg-[#c4a27a22] text-[#c4a27a]' : 'bg-green-500/10 text-green-500'}`}>
//     {children}
//   </span>
// );

// const Skeleton = ({ className = 'h-4 w-full' }: { className?: string }) => (
//   <div className={`${className} animate-pulse rounded-md bg-[#171d24]`} />
// );

// // ── Avatar helper — fixes the double-render bug ────────────
// function Avatar({ url, name, size = 10 }: { url: string | null | undefined; name: string | null | undefined; size?: number }) {
//   const sizeClass = `h-${size} w-${size}`;
//   if (url) {
//     return (
//       <img
//         src={url}
//         alt={name || ''}
//         className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
//       />
//     );
//   }
//   return (
//     <div className={`${sizeClass} rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 flex-shrink-0`}>
//       {name?.charAt(0)?.toUpperCase() || '?'}
//     </div>
//   );
// }

// // ── Activity label helper ──────────────────────────────────
// function activityLabel(type: string): string {
//   switch (type) {
//     case 'post_created': return 'shared an update';
//     case 'member_joined': return 'joined the circle';
//     case 'proof_uploaded': return 'uploaded a proof';
//     case 'task_completed': return 'completed a task';
//     case 'streak_milestone': return 'hit a streak milestone';
//     default: return 'was active';
//   }
// }

// function timeAgo(dateStr: string): string {
//   const diff = Date.now() - new Date(dateStr).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// }

// // ── How It Works Modal ─────────────────────────────────────
// function HowItWorksModal({ onClose }: { onClose: () => void }) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl max-w-md w-full p-6`}>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className={`${COLORS.text} font-bold text-lg`}>How Execution Circles Work</h2>
//           <button onClick={onClose} className={`${COLORS.textMuted} hover:text-white`}><X size={18} /></button>
//         </div>
//         <div className="space-y-4">
//           {[
//             { step: '1', title: 'Matched by Goal & Level', desc: 'You are grouped with peers who share your goal, timeline, and current skill level.' },
//             { step: '2', title: 'Weekly Rematching', desc: 'Every week circles are reshuffled based on accountability scores so you always train with peers at your level.' },
//             { step: '3', title: 'Score by Action', desc: 'Completing daily tasks (+2 pts), uploading proofs (+3 pts), and finishing weekly challenges (+50 pts) all raise your score.' },
//             { step: '4', title: 'Rank Up', desc: 'Score 90+ to reach Diamond rank. Your rank determines which circle you are placed in next cycle.' },
//           ].map((item) => (
//             <div key={item.step} className="flex gap-3">
//               <div className="h-7 w-7 rounded-full bg-[#c4a27a22] text-[#c4a27a] font-bold text-sm flex items-center justify-center shrink-0">{item.step}</div>
//               <div>
//                 <p className={`${COLORS.text} text-sm font-semibold`}>{item.title}</p>
//                 <p className={`${COLORS.textMuted} text-xs`}>{item.desc}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//         <button onClick={onClose} className={`mt-6 w-full py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm`}>Got it</button>
//       </div>
//     </div>
//   );
// }

// // ── Request Change Modal ───────────────────────────────────
// function RequestChangeModal({ circleId, onClose }: { circleId: string; onClose: () => void }) {
//   const [reason, setReason] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [done, setDone] = useState(false);

//   const handleSubmit = async () => {
//     if (!reason.trim()) return;
//     setSubmitting(true);
//     try {
//       await api.requestChange(circleId, reason);
//       setDone(true);
//     } catch (e) { console.error(e); }
//     finally { setSubmitting(false); }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
//       <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl max-w-md w-full p-6`}>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className={`${COLORS.text} font-bold text-lg`}>Request Circle Change</h2>
//           <button onClick={onClose} className={`${COLORS.textMuted} hover:text-white`}><X size={18} /></button>
//         </div>
//         {done ? (
//           <div className="text-center py-6">
//             <p className="text-green-500 font-bold text-lg mb-2">Request Submitted!</p>
//             <p className={`${COLORS.textMuted} text-sm`}>Our team will review your request within 24–48 hours.</p>
//             <button onClick={onClose} className={`mt-6 px-6 py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm`}>Close</button>
//           </div>
//         ) : (
//           <>
//             <p className={`${COLORS.textMuted} text-sm mb-4`}>Tell us why you'd like to be placed in a different circle.</p>
//             <textarea
//               className={`w-full bg-[#0f1318] border ${COLORS.border} rounded-xl p-3 text-sm outline-none ${COLORS.text} h-28 resize-none`}
//               placeholder="e.g. The circle is not active enough..."
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//             />
//             <div className="flex gap-3 mt-4">
//               <button onClick={onClose} className={`flex-1 py-2 border ${COLORS.border} rounded-xl text-sm font-medium ${COLORS.textMuted}`}>Cancel</button>
//               <button onClick={handleSubmit} disabled={submitting || !reason.trim()} className={`flex-1 py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm disabled:opacity-50`}>
//                 {submitting ? 'Submitting...' : 'Submit Request'}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Hero ───────────────────────────────────────────────────
// function CircleHero({ circle, onHowItWorks }: { circle: CircleDetail; onHowItWorks: () => void }) {
//   return (
//     <div className="mb-8">
//       <div className="mb-4">
//         <h1 className={`text-2xl font-bold ${COLORS.text} mb-1`}>{circle.name}</h1>
//         <p className={`${COLORS.textMuted} text-sm`}>You're matched with {circle.member_count} focused peers on a similar journey.</p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <Card className="p-4 flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-[#c4a27a11] flex items-center justify-center border border-[#c4a27a33]">
//             <Target className={COLORS.accent} size={24} />
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Your Circle</p>
//             <div className="flex items-center gap-2">
//               <span className={COLORS.text + ' font-bold text-sm'}>{circle.name}</span>
//               <Badge>Active</Badge>
//             </div>
//           </div>
//         </Card>
//         <Card className="p-4 flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
//             <Award className="text-yellow-500" size={24} />
//           </div>
//           <div>
//             <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Level</p>
//             <span className={COLORS.text + ' font-bold'}>{circle.current_level.toUpperCase()}</span>
//           </div>
//         </Card>
//         <Card className="p-4 flex items-center gap-4">
//           <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
//             <TrendingUp className="text-green-500" size={24} />
//           </div>
//           <div className="flex-1">
//             <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Health Score</p>
//             <span className="text-green-500 font-bold text-lg">{circle.health_score}%</span>
//           </div>
//         </Card>
//       </div>
//       <div className={`mt-4 p-3 rounded-xl border ${COLORS.border} bg-[#0f1318] flex items-center justify-between text-xs ${COLORS.textMuted}`}>
//         <div className="flex items-center gap-2">
//           <Zap size={14} className={COLORS.accent} />
//           <span>Matched based on your goal, timeline, consistency, and execution pace.</span>
//         </div>
//         <button onClick={onHowItWorks} className={COLORS.accent + ' font-medium hover:underline'}>How it works?</button>
//       </div>
//     </div>
//   );
// }

// // ── Accountability Row ─────────────────────────────────────
// function AccountabilityRow({ circle }: { circle: CircleDetail }) {
//   return (
//     <div className="mb-8">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className={`${COLORS.text} font-semibold`}>Your Accountability Circle</h2>
//         <p className={`${COLORS.textMuted} text-xs`}>Circle refreshes in 6 days</p>
//       </div>
//       <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
//         {circle.members.map((member, idx) => (
//           <div key={member.id} className="flex flex-col items-center gap-3 min-w-[80px]">
//             <div className="relative">
//               {/* FIXED: Avatar component prevents double-render of img + fallback */}
//               <Avatar url={member.profile?.avatar_url} name={member.profile?.full_name} size={20} />
//               {idx === 0 && (
//                 <div className="absolute -bottom-1 -right-1 bg-[#c4a27a] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">YOU</div>
//               )}
//             </div>
//             <div className="text-center">
//               <p className={`${COLORS.text} text-sm font-medium truncate w-20`}>{member.profile?.full_name || 'Unknown'}</p>
//               <p className={`${COLORS.textMuted} text-[11px]`}>{member.weekly_completion || 0}% this week</p>
//             </div>
//           </div>
//         ))}
//         <button className={`h-20 w-20 rounded-full border-2 border-dashed ${COLORS.border} flex items-center justify-center ${COLORS.textMuted} hover:border-[#c4a27a] hover:text-[#c4a27a] transition-colors flex-shrink-0`}>
//           <Plus size={24} />
//         </button>
//       </div>
//       <div className={`mt-6 p-4 rounded-2xl bg-[#0f1318] ${COLORS.border} border grid grid-cols-1 md:grid-cols-3 gap-4`}>
//         <div className="flex items-center gap-3">
//           <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center">🎯</div>
//           <div>
//             <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Circle Focus</p>
//             <p className={`${COLORS.text} text-sm font-medium`}>{circle.goal}</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 md:border-l border-[#171d24] md:pl-4">
//           <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center">🏆</div>
//           <div>
//             <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Duration</p>
//             <p className={`${COLORS.text} text-sm font-medium`}>{circle.duration_months} Months</p>
//           </div>
//         </div>
//         <div className="flex items-center gap-3 md:border-l border-[#171d24] md:pl-4">
//           <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center">📅</div>
//           <div>
//             <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Members</p>
//             <p className={`${COLORS.text} text-sm font-medium`}>{circle.member_count} Active</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Performance ────────────────────────────────────────────
// function PerformanceSection({ circle }: { circle: CircleDetail }) {
//   const metrics = [
//     { label: 'Health Score', value: `${circle.health_score}%`, trend: 'This week', icon: <Target size={16} /> },
//     { label: 'Weekly Posts', value: `${circle.weekly_activity_count}`, trend: 'Circle activity', icon: <Activity size={16} /> },
//     { label: 'Members', value: `${circle.member_count}`, trend: 'In your circle', icon: <Zap size={16} /> },
//     { label: 'Top Streak', value: `${circle.top_performers[0]?.streak_days ?? 0}d`, trend: 'Best in circle', icon: <Flame size={16} /> },
//     { label: 'Top Score', value: `${circle.top_performers[0]?.total_points ?? 0}`, trend: 'Highest points', icon: <TrendingUp size={16} /> },
//   ];

//   return (
//     <div className="mb-8">
//       <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Performance</h2>
//       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
//         {metrics.map((m, i) => (
//           <Card key={i} className="p-4">
//             <div className="flex items-center gap-2 text-zinc-500 mb-3">
//               {m.icon}
//               <span className="text-[11px] font-medium uppercase tracking-tight">{m.label}</span>
//             </div>
//             <div className={`${COLORS.text} text-xl font-bold mb-1`}>{m.value}</div>
//             <div className={`${COLORS.textMuted} text-[10px]`}>{m.trend}</div>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// // ── Post Card ──────────────────────────────────────────────
// // FIXED: inline like + comment state, no full reload needed
// function PostCard({
//   post,
//   onCommentAdded,
// }: {
//   post: CirclePostWithAuthor;
//   onCommentAdded: (postId: string) => void;
// }) {
//   const [liked, setLiked] = useState(post.liked_by_me);
//   const [likesCount, setLikesCount] = useState(post.likes_count);
//   const [showComments, setShowComments] = useState(false);
//   const [commentText, setCommentText] = useState('');
//   const [comments, setComments] = useState<CircleCommentWithAuthor[]>(post.recent_comments);
//   const [submittingComment, setSubmittingComment] = useState(false);
//   const [togglingLike, setTogglingLike] = useState(false);

//   const isProof = post.content.includes('[IMAGE:');
//   const cleanContent = post.content.replace(/\[IMAGE:.*?\]/s, '').trim();
//   const imgMatch = post.content.match(/\[IMAGE:(.*?)\]/);

//   const handleLike = async () => {
//     if (togglingLike) return;
//     // Optimistic update
//     setLiked((prev) => !prev);
//     setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
//     setTogglingLike(true);
//     try {
//       const result = await api.toggleLike(post.id);
//       // Reconcile with server truth
//       setLiked(result.liked);
//       setLikesCount(result.likes_count);
//     } catch (e) {
//       // Rollback on failure
//       setLiked((prev) => !prev);
//       setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
//       console.error(e);
//     } finally {
//       setTogglingLike(false);
//     }
//   };

//   const handleComment = async () => {
//     if (!commentText.trim() || submittingComment) return;
//     setSubmittingComment(true);
//     try {
//       const { comment } = await api.createComment({ post_id: post.id, content: commentText.trim() });
//       // Append comment locally without full reload
//       setComments((prev) => [
//         ...prev,
//         { ...comment, author: { id: comment.user_id, full_name: 'You', avatar_url: null, username: null } },
//       ]);
//       setCommentText('');
//       onCommentAdded(post.id);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setSubmittingComment(false);
//     }
//   };

//   return (
//     <Card className="p-4">
//       <div className="flex gap-3 mb-3">
//         <Avatar url={post.author?.avatar_url} name={post.author?.full_name} size={10} />
//         <div>
//           <span className={`${COLORS.text} font-semibold text-sm`}>{post.author?.full_name || 'Unknown'}</span>
//           <p className={`${COLORS.textMuted} text-[11px]`}>{new Date(post.created_at).toLocaleDateString()}</p>
//         </div>
//       </div>

//       {cleanContent && (
//         <p className={`text-sm mb-3 whitespace-pre-wrap ${COLORS.text}`}>{cleanContent}</p>
//       )}
//       {isProof && imgMatch && (
//         <img src={imgMatch[1]} alt="Proof" className="rounded-lg max-h-64 object-cover mb-3 w-full" />
//       )}

//       <div className={`flex items-center gap-4 border-t ${COLORS.border} pt-3`}>
//         {/* FIXED: Like button with optimistic update */}
//         <button
//           onClick={handleLike}
//           disabled={togglingLike}
//           className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-red-400' : COLORS.textMuted + ' hover:text-red-400'}`}
//         >
//           <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
//           {likesCount}
//         </button>

//         {/* FIXED: Comment button toggles comment section */}
//         <button
//           onClick={() => setShowComments((v) => !v)}
//           className={`flex items-center gap-1.5 text-xs font-medium ${COLORS.textMuted} hover:text-[#c4a27a] transition-colors`}
//         >
//           <MessageCircle size={14} />
//           {comments.length + (post.comments_count - post.recent_comments.length > 0 ? post.comments_count - post.recent_comments.length : 0)}
//         </button>
//       </div>

//       {/* Comment section — shown when toggle is active */}
//       {showComments && (
//         <div className={`mt-3 border-t ${COLORS.border} pt-3 space-y-3`}>
//           {comments.map((c) => (
//             <div key={c.id} className="flex gap-2">
//               <Avatar url={c.author?.avatar_url} name={c.author?.full_name} size={7} />
//               <div className={`bg-[#0f1318] rounded-xl px-3 py-2 flex-1`}>
//                 <p className={`${COLORS.text} text-xs font-semibold`}>{c.author?.full_name || 'Unknown'}</p>
//                 <p className={`${COLORS.textMuted} text-xs mt-0.5`}>{c.content}</p>
//               </div>
//             </div>
//           ))}
//           <div className="flex gap-2 mt-2">
//             <input
//               type="text"
//               placeholder="Write a comment..."
//               value={commentText}
//               onChange={(e) => setCommentText(e.target.value)}
//               onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
//               className={`flex-1 bg-[#0f1318] border ${COLORS.border} rounded-xl px-3 py-2 text-xs ${COLORS.text} outline-none`}
//             />
//             <button
//               onClick={handleComment}
//               disabled={submittingComment || !commentText.trim()}
//               className={`p-2 rounded-xl ${COLORS.accentBg} text-black disabled:opacity-50`}
//             >
//               <Send size={14} />
//             </button>
//           </div>
//         </div>
//       )}
//     </Card>
//   );
// }

// // ── Feed Section ───────────────────────────────────────────
// function FeedSection({
//   circleId,
//   feed,
//   onFeedUpdated,
// }: {
//   circleId: string;
//   feed: CirclePostWithAuthor[];
//   onFeedUpdated: () => void;
// }) {
//   const [content, setContent] = useState('');
//   const [proofUrl, setProofUrl] = useState('');
//   const [posting, setPosting] = useState(false);
//   const [morePosts, setMorePosts] = useState<CirclePostWithAuthor[]>([]);
//   const [cursor, setCursor] = useState<string | null>(null);
//   const [loadingMore, setLoadingMore] = useState(false);

//   useEffect(() => {
//     if (feed.length > 0) setCursor(feed[feed.length - 1]?.created_at ?? null);
//     setMorePosts([]); // reset on feed refresh
//   }, [feed]);

//   const handlePost = async () => {
//     if (!content.trim() && !proofUrl.trim()) return;
//     setPosting(true);
//     try {
//       if (proofUrl.trim()) {
//         await api.uploadProof(circleId, proofUrl.trim(), content.trim());
//       } else {
//         await api.createPost({ circle_id: circleId, content: content.trim(), post_type: 'update' });
//       }
//       setContent('');
//       setProofUrl('');
//       onFeedUpdated(); // triggers full reload only for new posts
//     } catch (e) { console.error(e); }
//     finally { setPosting(false); }
//   };

//   const handleLoadMore = async () => {
//     if (!cursor) return;
//     setLoadingMore(true);
//     try {
//       const res = await api.getFeed(circleId, cursor);
//       setMorePosts((prev) => [...prev, ...res.posts]);
//       setCursor(res.cursor ?? null);
//     } catch (e) { console.error(e); }
//     finally { setLoadingMore(false); }
//   };

//   const allPosts = [...feed, ...morePosts];

//   return (
//     <div className="pt-8 border-t border-[#171d24]">
//       <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Feed</h2>

//       <Card className="p-4 mb-6">
//         <textarea
//           className={`w-full bg-[#0f1318] border ${COLORS.border} rounded-xl p-3 text-sm outline-none ${COLORS.text} h-20 resize-none`}
//           placeholder="Share an update, win, or question..."
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//         />
//         <input
//           type="text"
//           placeholder="Optional: Paste image URL for proof"
//           value={proofUrl}
//           onChange={(e) => setProofUrl(e.target.value)}
//           className={`w-full mt-2 bg-[#0f1318] border ${COLORS.border} rounded-lg p-2 text-xs ${COLORS.text} outline-none`}
//         />
//         <div className="flex justify-end mt-3">
//           <button
//             onClick={handlePost}
//             disabled={posting || (!content.trim() && !proofUrl.trim())}
//             className={`${COLORS.accentBg} text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50`}
//           >
//             {posting ? 'Posting...' : proofUrl.trim() ? '📸 Upload Proof' : 'Post'}
//           </button>
//         </div>
//       </Card>

//       <div className="space-y-4">
//         {allPosts.map((post) => (
//           <PostCard
//             key={post.id}
//             post={post}
//             onCommentAdded={() => { /* count already updated locally in PostCard */ }}
//           />
//         ))}
//       </div>

//       {cursor && (
//         <button
//           onClick={handleLoadMore}
//           disabled={loadingMore}
//           className={`w-full mt-4 py-2 border ${COLORS.border} rounded-xl text-xs font-bold ${COLORS.textMuted} hover:text-[#c4a27a] disabled:opacity-50 flex items-center justify-center gap-2`}
//         >
//           {loadingMore ? 'Loading...' : <><ChevronDown size={14} /> Load More</>}
//         </button>
//       )}
//     </div>
//   );
// }

// // ── Sidebar ────────────────────────────────────────────────
// // FIXED: uses real circle_activity data, real leaderboard data
// function CircleSidebar({
//   insights,
//   circle,
//   activities,
//   leaderboard,
//   onRequestChange,
// }: {
//   insights: CircleInsights | null;
//   circle: CircleDetail;
//   activities: CircleActivityWithProfile[];
//   leaderboard: LeaderboardEntry[];
//   onRequestChange: () => void;
// }) {
//   return (
//     <div className="space-y-6 lg:sticky lg:top-8">
//       {/* Insights */}
//       <Card className="p-5">
//         <h3 className={`${COLORS.text} font-semibold mb-4 flex items-center gap-2`}>
//           <Activity size={16} className={COLORS.accent} /> Circle Insights
//         </h3>
//         {insights ? (
//           <div className="space-y-3">
//             <div className="flex justify-between items-center">
//               <p className={`${COLORS.textMuted} text-xs`}>Better than similar circles</p>
//               <p className="text-green-500 font-bold text-sm">{insights.better_than}%</p>
//             </div>
//             <div className="flex items-end justify-between h-14 gap-1 mt-2">
//               {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
//                 <div key={i} className="flex-1 bg-[#171d24] rounded-t-sm relative">
//                   <div className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${i === 3 ? 'bg-[#c4a27a]' : 'bg-zinc-600'}`} style={{ height: `${h}%` }} />
//                 </div>
//               ))}
//             </div>
//             <div className="space-y-1 pt-2">
//               <div className="flex justify-between text-xs"><span className={COLORS.textMuted}>Avg Score</span><span className={COLORS.text}>{insights.avg_score}</span></div>
//               <div className="flex justify-between text-xs"><span className={COLORS.textMuted}>Avg Streak</span><span className={COLORS.text}>{insights.avg_streak}d</span></div>
//               <div className="flex justify-between text-xs"><span className={COLORS.textMuted}>Task Completion</span><span className={COLORS.text}>{insights.avg_completion}%</span></div>
//             </div>
//           </div>
//         ) : <Skeleton className="h-32" />}
//       </Card>

//       {/* Mini Leaderboard */}
//       <Card className="p-5">
//         <h3 className={`${COLORS.text} font-semibold mb-4 flex items-center gap-2`}>
//           <Award size={16} className="text-yellow-500" /> Top Performers
//         </h3>
//         {leaderboard.length === 0 ? (
//           <Skeleton className="h-24" />
//         ) : (
//           <div className="space-y-3">
//             {leaderboard.slice(0, 5).map((entry, i) => (
//               <div key={entry.member.id} className="flex items-center gap-3">
//                 <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-600' : COLORS.textMuted}`}>
//                   #{entry.rank}
//                 </span>
//                 <Avatar url={entry.member.profile?.avatar_url} name={entry.member.profile?.full_name} size={8} />
//                 <div className="flex-1 min-w-0">
//                   <p className={`${COLORS.text} text-xs font-medium truncate`}>{entry.member.profile?.full_name || 'Unknown'}</p>
//                   <p className={`${COLORS.textMuted} text-[10px]`}>{entry.member.streak_days}d streak</p>
//                 </div>
//                 <span className={`${COLORS.accent} text-xs font-bold`}>{entry.points}pts</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       {/* Upgrade */}
//       <Card className="p-5">
//         <div className="flex items-center gap-2 mb-3">
//           <Award size={16} className="text-yellow-500" />
//           <h3 className={`${COLORS.text} font-semibold text-sm`}>Next Circle Upgrade</h3>
//         </div>
//         <p className={`${COLORS.textMuted} text-xs mb-3`}>Maintain 90%+ consistency for 7 more days to unlock Diamond Circle</p>
//         <div className="h-2 w-full bg-[#171d24] rounded-full overflow-hidden mb-1">
//           <div className="h-full bg-yellow-500" style={{ width: '43%' }} />
//         </div>
//         <p className={`${COLORS.textMuted} text-[10px] text-right`}>3/7 days</p>
//       </Card>

//       {/* FIXED: Real circle activity */}
//       <Card className="p-5">
//         <h3 className={`${COLORS.text} font-semibold mb-4`}>Recent Circle Activity</h3>
//         {activities.length === 0 ? (
//           <p className={`${COLORS.textMuted} text-xs text-center py-4`}>No activity yet. Be the first to post!</p>
//         ) : (
//           <div className="space-y-3">
//             {activities.map((act) => (
//               <div key={act.id} className="flex items-start gap-2">
//                 <Avatar url={act.profile?.avatar_url} name={act.profile?.full_name} size={7} />
//                 <div className="flex-1 min-w-0">
//                   <span className={`${COLORS.text} text-xs font-medium`}>{act.profile?.full_name || 'Someone'}</span>
//                   <span className={`${COLORS.textMuted} text-xs ml-1`}>{activityLabel(act.activity_type)}</span>
//                 </div>
//                 <span className="text-[10px] text-zinc-600 shrink-0">{timeAgo(act.created_at)}</span>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       {/* Request Change */}
//       <Card className="p-5 text-center">
//         <h3 className={`${COLORS.text} font-semibold mb-2 text-sm`}>Need a Change?</h3>
//         <p className={`${COLORS.textMuted} text-xs mb-4`}>Not feeling the right match? Request a circle change.</p>
//         <button
//           onClick={onRequestChange}
//           className={`w-full py-2 rounded-xl border ${COLORS.border} ${COLORS.text} text-xs font-medium hover:bg-white/5 transition-colors`}
//         >
//           Request Change
//         </button>
//       </Card>
//     </div>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────
// export default function ExecutionCirclePage() {
//   const [circle, setCircle] = useState<CircleDetail | null>(null);
//   const [feed, setFeed] = useState<CirclePostWithAuthor[]>([]);
//   const [insights, setInsights] = useState<CircleInsights | null>(null);
//   const [activities, setActivities] = useState<CircleActivityWithProfile[]>([]);
//   const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isJoining, setIsJoining] = useState(false);
//   const [showHowItWorks, setShowHowItWorks] = useState(false);
//   const [showChangeModal, setShowChangeModal] = useState(false);

//   const loadData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       const circleData = await api.getMyCircle();
//       setCircle(circleData);

//       // Load all sidebar + feed data in parallel
//       const [feedData, insightsData, activitiesData, leaderboardData] = await Promise.all([
//         api.getFeed(circleData.id),
//         api.getInsights(circleData.id).catch(() => null),
//         api.getCircleActivity(circleData.id).catch(() => []),
//         api.getLeaderboard(circleData.id).catch(() => []),
//       ]);

//       setFeed(feedData.posts);
//       setInsights(insightsData as CircleInsights | null);
//       setActivities(activitiesData);
//       setLeaderboard(leaderboardData);
//     } catch (e: any) {
//       setError(e.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   // Lightweight feed-only refresh (called after new post)
//   const refreshFeed = useCallback(async () => {
//     if (!circle) return;
//     try {
//       const feedData = await api.getFeed(circle.id);
//       setFeed(feedData.posts);
//       // Also refresh activity sidebar
//       const acts = await api.getCircleActivity(circle.id).catch(() => []);
//       setActivities(acts);
//     } catch (e) { console.error(e); }
//   }, [circle]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const handleManualJoin = async () => {
//     setIsJoining(true);
//     try {
//       await api.createOrJoinCircle({ goal: 'Build a SaaS product', duration_months: 6, current_level: 'intermediate' });
//       await loadData();
//     } catch (e: any) { console.error(e); }
//     finally { setIsJoining(false); }
//   };

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen ${COLORS.bg} p-8`}>
//         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
//           <div className="lg:col-span-9 space-y-6">
//             <Skeleton className="h-8 w-48" />
//             <div className="grid grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
//             <Skeleton className="h-48" />
//             <Skeleton className="h-64" />
//           </div>
//           <div className="lg:col-span-3 space-y-4">
//             <Skeleton className="h-48" /><Skeleton className="h-40" /><Skeleton className="h-32" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !circle) {
//     return (
//       <div className={`min-h-screen ${COLORS.bg} flex items-center justify-center p-6`}>
//         <div className={`${COLORS.card} ${COLORS.border} border p-12 rounded-3xl text-center max-w-md`}>
//           <div className="h-20 w-20 bg-[#c4a27a22] rounded-full flex items-center justify-center mx-auto mb-6">
//             <Target className={COLORS.accent} size={40} />
//           </div>
//           <h2 className={`${COLORS.text} text-2xl font-bold mb-2`}>Join Your First Execution Circle</h2>
//           <p className={`${COLORS.textMuted} mb-8`}>You haven't been matched yet. Let us find your ideal high-performance peers.</p>
//           <button
//             onClick={handleManualJoin}
//             disabled={isJoining}
//             className={`w-full py-3 ${COLORS.accentBg} text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50`}
//           >
//             {isJoining ? 'Matching...' : 'Find My Circle'}
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen ${COLORS.bg} text-[#e8e2d9] p-4 md:p-8`}>
//       {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
//       {showChangeModal && <RequestChangeModal circleId={circle.id} onClose={() => setShowChangeModal(false)} />}

//       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
//         <div className="lg:col-span-9 space-y-8">
//           <CircleHero circle={circle} onHowItWorks={() => setShowHowItWorks(true)} />
//           <AccountabilityRow circle={circle} />
//           <PerformanceSection circle={circle} />
//           <FeedSection circleId={circle.id} feed={feed} onFeedUpdated={refreshFeed} />
//         </div>
//         <div className="lg:col-span-3">
//           <CircleSidebar
//             insights={insights}
//             circle={circle}
//             activities={activities}
//             leaderboard={leaderboard}
//             onRequestChange={() => setShowChangeModal(true)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
































'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  CircleDetail,
  CirclePostWithAuthor,
  CircleCommentWithAuthor,
  LeaderboardEntry,
  CircleInsights,
  CircleActivityWithProfile,
} from '@/types/executioncircle.types';
import * as api from '../services/executioncircle.service';
import Sidebar from '../components/Sidebar';
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
  Menu,
} from 'lucide-react';

// ── Design System ──────────────────────────────────────────
const COLORS = {
  bg: 'bg-[#0a0d11]',
  surface: 'bg-[#0f1318]',
  card: 'bg-[#121820]',
  border: 'border-[#171d24]',
  accent: 'text-[#c4a27a]',
  accentBg: 'bg-[#c4a27a]',
  text: 'text-[#e8e2d9]',
  textMuted: 'text-[#6b7280]',
};

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'accent' }: { children: React.ReactNode; variant?: 'accent' | 'success' }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${variant === 'accent' ? 'bg-[#c4a27a22] text-[#c4a27a]' : 'bg-green-500/10 text-green-500'}`}>
    {children}
  </span>
);

const Skeleton = ({ className = 'h-4 w-full' }: { className?: string }) => (
  <div className={`${className} animate-pulse rounded-md bg-[#171d24]`} />
);

// ── Avatar helper — fixes the double-render bug ────────────
function Avatar({ url, name, size = 10 }: { url: string | null | undefined; name: string | null | undefined; size?: number }) {
  const sizeClass = `h-${size} w-${size}`;
  if (url) {
    return (
      <img
        src={url}
        alt={name || ''}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400 flex-shrink-0`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

// ── Activity label helper ──────────────────────────────────
function activityLabel(type: string): string {
  switch (type) {
    case 'post_created': return 'shared an update';
    case 'member_joined': return 'joined the circle';
    case 'proof_uploaded': return 'uploaded a proof';
    case 'task_completed': return 'completed a task';
    case 'streak_milestone': return 'hit a streak milestone';
    default: return 'was active';
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

// ── How It Works Modal ─────────────────────────────────────
function HowItWorksModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl max-w-md w-full p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${COLORS.text} font-bold text-lg`}>How Execution Circles Work</h2>
          <button onClick={onClose} className={`${COLORS.textMuted} hover:text-white`}><X size={18} /></button>
        </div>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Matched by Goal & Level', desc: 'You are grouped with peers who share your goal, timeline, and current skill level.' },
            { step: '2', title: 'Weekly Rematching', desc: 'Every week circles are reshuffled based on accountability scores so you always train with peers at your level.' },
            { step: '3', title: 'Score by Action', desc: 'Completing daily tasks (+2 pts), uploading proofs (+3 pts), and finishing weekly challenges (+50 pts) all raise your score.' },
            { step: '4', title: 'Rank Up', desc: 'Score 90+ to reach Diamond rank. Your rank determines which circle you are placed in next cycle.' },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="h-7 w-7 rounded-full bg-[#c4a27a22] text-[#c4a27a] font-bold text-sm flex items-center justify-center shrink-0">{item.step}</div>
              <div>
                <p className={`${COLORS.text} text-sm font-semibold`}>{item.title}</p>
                <p className={`${COLORS.textMuted} text-xs`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onClose} className={`mt-6 w-full py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm`}>Got it</button>
      </div>
    </div>
  );
}

// ── Request Change Modal ───────────────────────────────────
function RequestChangeModal({ circleId, onClose }: { circleId: string; onClose: () => void }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await api.requestChange(circleId, reason);
      setDone(true);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className={`${COLORS.card} ${COLORS.border} border rounded-2xl max-w-md w-full p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`${COLORS.text} font-bold text-lg`}>Request Circle Change</h2>
          <button onClick={onClose} className={`${COLORS.textMuted} hover:text-white`}><X size={18} /></button>
        </div>
        {done ? (
          <div className="text-center py-6">
            <p className="text-green-500 font-bold text-lg mb-2">Request Submitted!</p>
            <p className={`${COLORS.textMuted} text-sm`}>Our team will review your request within 24–48 hours.</p>
            <button onClick={onClose} className={`mt-6 px-6 py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm`}>Close</button>
          </div>
        ) : (
          <>
            <p className={`${COLORS.textMuted} text-sm mb-4`}>Tell us why you'd like to be placed in a different circle.</p>
            <textarea
              className={`w-full bg-[#0f1318] border ${COLORS.border} rounded-xl p-3 text-sm outline-none ${COLORS.text} h-28 resize-none`}
              placeholder="e.g. The circle is not active enough..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button onClick={onClose} className={`flex-1 py-2 border ${COLORS.border} rounded-xl text-sm font-medium ${COLORS.textMuted}`}>Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !reason.trim()} className={`flex-1 py-2 ${COLORS.accentBg} text-black font-bold rounded-xl text-sm disabled:opacity-50`}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────
function CircleHero({ circle, onHowItWorks }: { circle: CircleDetail; onHowItWorks: () => void }) {
  return (
    <div className="mb-8">
      <div className="mb-4">
        <h1 className={`text-2xl font-bold ${COLORS.text} mb-1`}>{circle.name}</h1>
        <p className={`${COLORS.textMuted} text-sm`}>You're matched with {circle.member_count} focused peers on a similar journey.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#c4a27a11] flex items-center justify-center border border-[#c4a27a33]">
            <Target className={COLORS.accent} size={24} />
          </div>
          <div>
            <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Your Circle</p>
            <div className="flex items-center gap-2">
              <span className={COLORS.text + ' font-bold text-sm'}>{circle.name}</span>
              <Badge>Active</Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30">
            <Award className="text-yellow-500" size={24} />
          </div>
          <div>
            <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Level</p>
            <span className={COLORS.text + ' font-bold'}>{circle.current_level.toUpperCase()}</span>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/30">
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <div className="flex-1">
            <p className={`${COLORS.textMuted} text-xs uppercase font-medium`}>Health Score</p>
            <span className="text-green-500 font-bold text-lg">{circle.health_score}%</span>
          </div>
        </Card>
      </div>
      <div className={`mt-4 p-3 rounded-xl border ${COLORS.border} bg-[#0f1318] flex items-center justify-between text-xs ${COLORS.textMuted}`}>
        <div className="flex items-center gap-2">
          <Zap size={14} className={COLORS.accent} />
          <span>Matched based on your goal, timeline, consistency, and execution pace.</span>
        </div>
        <button onClick={onHowItWorks} className={COLORS.accent + ' font-medium hover:underline'}>How it works?</button>
      </div>
    </div>
  );
}

// ── Accountability Row ─────────────────────────────────────
function AccountabilityRow({ circle }: { circle: CircleDetail }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className={`${COLORS.text} font-semibold`}>Your Accountability Circle</h2>
        <p className={`${COLORS.textMuted} text-xs`}>Circle refreshes in 6 days</p>
      </div>
      <div className="flex overflow-x-auto gap-6 pb-4 no-scrollbar">
        {circle.members.map((member, idx) => (
          <div key={member.id} className="flex flex-col items-center gap-3 min-w-[80px]">
            <div className="relative">
              {/* FIXED: Avatar component prevents double-render of img + fallback */}
              <Avatar url={member.profile?.avatar_url} name={member.profile?.full_name} size={20} />
              {idx === 0 && (
                <div className="absolute -bottom-1 -right-1 bg-[#c4a27a] text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">YOU</div>
              )}
            </div>
            <div className="text-center">
              <p className={`${COLORS.text} text-sm font-medium truncate w-20`}>{member.profile?.full_name || 'Unknown'}</p>
              <p className={`${COLORS.textMuted} text-[11px]`}>{member.weekly_completion || 0}% this week</p>
            </div>
          </div>
        ))}
        <button className={`h-20 w-20 rounded-full border-2 border-dashed ${COLORS.border} flex items-center justify-center ${COLORS.textMuted} hover:border-[#c4a27a] hover:text-[#c4a27a] transition-colors flex-shrink-0`}>
          <Plus size={24} />
        </button>
      </div>
      <div className={`mt-6 p-4 rounded-2xl bg-[#0f1318] ${COLORS.border} border grid grid-cols-1 md:grid-cols-3 gap-4`}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center">🎯</div>
          <div>
            <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Circle Focus</p>
            <p className={`${COLORS.text} text-sm font-medium`}>{circle.goal}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:border-l border-[#171d24] md:pl-4">
          <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center">🏆</div>
          <div>
            <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Duration</p>
            <p className={`${COLORS.text} text-sm font-medium`}>{circle.duration_months} Months</p>
          </div>
        </div>
        <div className="flex items-center gap-3 md:border-l border-[#171d24] md:pl-4">
          <div className="h-8 w-8 rounded bg-[#c4a27a22] flex items-center justify-center">📅</div>
          <div>
            <p className={`${COLORS.textMuted} text-[10px] uppercase`}>Members</p>
            <p className={`${COLORS.text} text-sm font-medium`}>{circle.member_count} Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Performance ────────────────────────────────────────────
function PerformanceSection({ circle }: { circle: CircleDetail }) {
  const metrics = [
    { label: 'Health Score', value: `${circle.health_score}%`, trend: 'This week', icon: <Target size={16} /> },
    { label: 'Weekly Posts', value: `${circle.weekly_activity_count}`, trend: 'Circle activity', icon: <Activity size={16} /> },
    { label: 'Members', value: `${circle.member_count}`, trend: 'In your circle', icon: <Zap size={16} /> },
    { label: 'Top Streak', value: `${circle.top_performers[0]?.streak_days ?? 0}d`, trend: 'Best in circle', icon: <Flame size={16} /> },
    { label: 'Top Score', value: `${circle.top_performers[0]?.total_points ?? 0}`, trend: 'Highest points', icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="mb-8">
      <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Performance</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center gap-2 text-zinc-500 mb-3">
              {m.icon}
              <span className="text-[11px] font-medium uppercase tracking-tight">{m.label}</span>
            </div>
            <div className={`${COLORS.text} text-xl font-bold mb-1`}>{m.value}</div>
            <div className={`${COLORS.textMuted} text-[10px]`}>{m.trend}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Post Card ──────────────────────────────────────────────
// FIXED: inline like + comment state, no full reload needed
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
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CircleCommentWithAuthor[]>(post.recent_comments);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  const isProof = post.content.includes('[IMAGE:');
  const cleanContent = post.content.replace(/\[IMAGE:.*?\]/s, '').trim();
  const imgMatch = post.content.match(/\[IMAGE:(.*?)\]/);

  const handleLike = async () => {
    if (togglingLike) return;
    // Optimistic update
    setLiked((prev) => !prev);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    setTogglingLike(true);
    try {
      const result = await api.toggleLike(post.id);
      // Reconcile with server truth
      setLiked(result.liked);
      setLikesCount(result.likes_count);
    } catch (e) {
      // Rollback on failure
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
      const { comment } = await api.createComment({ post_id: post.id, content: commentText.trim() });
      // Append comment locally without full reload
      setComments((prev) => [
        ...prev,
        { ...comment, author: { id: comment.user_id, full_name: 'You', avatar_url: null, username: null } },
      ]);
      setCommentText('');
      onCommentAdded(post.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex gap-3 mb-3">
        <Avatar url={post.author?.avatar_url} name={post.author?.full_name} size={10} />
        <div>
          <span className={`${COLORS.text} font-semibold text-sm`}>{post.author?.full_name || 'Unknown'}</span>
          <p className={`${COLORS.textMuted} text-[11px]`}>{new Date(post.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {cleanContent && (
        <p className={`text-sm mb-3 whitespace-pre-wrap ${COLORS.text}`}>{cleanContent}</p>
      )}
      {isProof && imgMatch && (
        <img src={imgMatch[1]} alt="Proof" className="rounded-lg max-h-64 object-cover mb-3 w-full" />
      )}

      <div className={`flex items-center gap-4 border-t ${COLORS.border} pt-3`}>
        {/* FIXED: Like button with optimistic update */}
        <button
          onClick={handleLike}
          disabled={togglingLike}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${liked ? 'text-red-400' : COLORS.textMuted + ' hover:text-red-400'}`}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
          {likesCount}
        </button>

        {/* FIXED: Comment button toggles comment section */}
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-medium ${COLORS.textMuted} hover:text-[#c4a27a] transition-colors`}
        >
          <MessageCircle size={14} />
          {comments.length + (post.comments_count - post.recent_comments.length > 0 ? post.comments_count - post.recent_comments.length : 0)}
        </button>
      </div>

      {/* Comment section — shown when toggle is active */}
      {showComments && (
        <div className={`mt-3 border-t ${COLORS.border} pt-3 space-y-3`}>
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <Avatar url={c.author?.avatar_url} name={c.author?.full_name} size={7} />
              <div className={`bg-[#0f1318] rounded-xl px-3 py-2 flex-1`}>
                <p className={`${COLORS.text} text-xs font-semibold`}>{c.author?.full_name || 'Unknown'}</p>
                <p className={`${COLORS.textMuted} text-xs mt-0.5`}>{c.content}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
              className={`flex-1 bg-[#0f1318] border ${COLORS.border} rounded-xl px-3 py-2 text-xs ${COLORS.text} outline-none`}
            />
            <button
              onClick={handleComment}
              disabled={submittingComment || !commentText.trim()}
              className={`p-2 rounded-xl ${COLORS.accentBg} text-black disabled:opacity-50`}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </Card>
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
  const [content, setContent] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [posting, setPosting] = useState(false);
  const [morePosts, setMorePosts] = useState<CirclePostWithAuthor[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (feed.length > 0) setCursor(feed[feed.length - 1]?.created_at ?? null);
    setMorePosts([]); // reset on feed refresh
  }, [feed]);

  const handlePost = async () => {
    if (!content.trim() && !proofUrl.trim()) return;
    setPosting(true);
    try {
      if (proofUrl.trim()) {
        await api.uploadProof(circleId, proofUrl.trim(), content.trim());
      } else {
        await api.createPost({ circle_id: circleId, content: content.trim(), post_type: 'update' });
      }
      setContent('');
      setProofUrl('');
      onFeedUpdated(); // triggers full reload only for new posts
    } catch (e) { console.error(e); }
    finally { setPosting(false); }
  };

  const handleLoadMore = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const res = await api.getFeed(circleId, cursor);
      setMorePosts((prev) => [...prev, ...res.posts]);
      setCursor(res.cursor ?? null);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  };

  const allPosts = [...feed, ...morePosts];

  return (
    <div className="pt-8 border-t border-[#171d24]">
      <h2 className={`${COLORS.text} font-semibold mb-6`}>Circle Feed</h2>

      <Card className="p-4 mb-6">
        <textarea
          className={`w-full bg-[#0f1318] border ${COLORS.border} rounded-xl p-3 text-sm outline-none ${COLORS.text} h-20 resize-none`}
          placeholder="Share an update, win, or question..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          placeholder="Optional: Paste image URL for proof"
          value={proofUrl}
          onChange={(e) => setProofUrl(e.target.value)}
          className={`w-full mt-2 bg-[#0f1318] border ${COLORS.border} rounded-lg p-2 text-xs ${COLORS.text} outline-none`}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handlePost}
            disabled={posting || (!content.trim() && !proofUrl.trim())}
            className={`${COLORS.accentBg} text-black text-xs font-bold px-4 py-2 rounded-lg disabled:opacity-50`}
          >
            {posting ? 'Posting...' : proofUrl.trim() ? '📸 Upload Proof' : 'Post'}
          </button>
        </div>
      </Card>

      <div className="space-y-4">
        {allPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onCommentAdded={() => { /* count already updated locally in PostCard */ }}
          />
        ))}
      </div>

      {cursor && (
        <button
          onClick={handleLoadMore}
          disabled={loadingMore}
          className={`w-full mt-4 py-2 border ${COLORS.border} rounded-xl text-xs font-bold ${COLORS.textMuted} hover:text-[#c4a27a] disabled:opacity-50 flex items-center justify-center gap-2`}
        >
          {loadingMore ? 'Loading...' : <><ChevronDown size={14} /> Load More</>}
        </button>
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────
// FIXED: uses real circle_activity data, real leaderboard data
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
        <h3 className={`${COLORS.text} font-semibold mb-4 flex items-center gap-2`}>
          <Activity size={16} className={COLORS.accent} /> Circle Insights
        </h3>
        {insights ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className={`${COLORS.textMuted} text-xs`}>Better than similar circles</p>
              <p className="text-green-500 font-bold text-sm">{insights.better_than}%</p>
            </div>
            <div className="flex items-end justify-between h-14 gap-1 mt-2">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <div key={i} className="flex-1 bg-[#171d24] rounded-t-sm relative">
                  <div className={`absolute bottom-0 left-0 right-0 rounded-t-sm ${i === 3 ? 'bg-[#c4a27a]' : 'bg-zinc-600'}`} style={{ height: `${h}%` }} />
                </div>
              ))}
            </div>
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs"><span className={COLORS.textMuted}>Avg Score</span><span className={COLORS.text}>{insights.avg_score}</span></div>
              <div className="flex justify-between text-xs"><span className={COLORS.textMuted}>Avg Streak</span><span className={COLORS.text}>{insights.avg_streak}d</span></div>
              <div className="flex justify-between text-xs"><span className={COLORS.textMuted}>Task Completion</span><span className={COLORS.text}>{insights.avg_completion}%</span></div>
            </div>
          </div>
        ) : <Skeleton className="h-32" />}
      </Card>

      {/* Mini Leaderboard */}
      <Card className="p-5">
        <h3 className={`${COLORS.text} font-semibold mb-4 flex items-center gap-2`}>
          <Award size={16} className="text-yellow-500" /> Top Performers
        </h3>
        {leaderboard.length === 0 ? (
          <Skeleton className="h-24" />
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <div key={entry.member.id} className="flex items-center gap-3">
                <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-amber-600' : COLORS.textMuted}`}>
                  #{entry.rank}
                </span>
                <Avatar url={entry.member.profile?.avatar_url} name={entry.member.profile?.full_name} size={8} />
                <div className="flex-1 min-w-0">
                  <p className={`${COLORS.text} text-xs font-medium truncate`}>{entry.member.profile?.full_name || 'Unknown'}</p>
                  <p className={`${COLORS.textMuted} text-[10px]`}>{entry.member.streak_days}d streak</p>
                </div>
                <span className={`${COLORS.accent} text-xs font-bold`}>{entry.points}pts</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Upgrade */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-yellow-500" />
          <h3 className={`${COLORS.text} font-semibold text-sm`}>Next Circle Upgrade</h3>
        </div>
        <p className={`${COLORS.textMuted} text-xs mb-3`}>Maintain 90%+ consistency for 7 more days to unlock Diamond Circle</p>
        <div className="h-2 w-full bg-[#171d24] rounded-full overflow-hidden mb-1">
          <div className="h-full bg-yellow-500" style={{ width: '43%' }} />
        </div>
        <p className={`${COLORS.textMuted} text-[10px] text-right`}>3/7 days</p>
      </Card>

      {/* FIXED: Real circle activity */}
      <Card className="p-5">
        <h3 className={`${COLORS.text} font-semibold mb-4`}>Recent Circle Activity</h3>
        {activities.length === 0 ? (
          <p className={`${COLORS.textMuted} text-xs text-center py-4`}>No activity yet. Be the first to post!</p>
        ) : (
          <div className="space-y-3">
            {activities.map((act) => (
              <div key={act.id} className="flex items-start gap-2">
                <Avatar url={act.profile?.avatar_url} name={act.profile?.full_name} size={7} />
                <div className="flex-1 min-w-0">
                  <span className={`${COLORS.text} text-xs font-medium`}>{act.profile?.full_name || 'Someone'}</span>
                  <span className={`${COLORS.textMuted} text-xs ml-1`}>{activityLabel(act.activity_type)}</span>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">{timeAgo(act.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Request Change */}
      <Card className="p-5 text-center">
        <h3 className={`${COLORS.text} font-semibold mb-2 text-sm`}>Need a Change?</h3>
        <p className={`${COLORS.textMuted} text-xs mb-4`}>Not feeling the right match? Request a circle change.</p>
        <button
          onClick={onRequestChange}
          className={`w-full py-2 rounded-xl border ${COLORS.border} ${COLORS.text} text-xs font-medium hover:bg-white/5 transition-colors`}
        >
          Request Change
        </button>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function ExecutionCirclePage() {
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
      setCircle(circleData);

      const [feedData, insightsData, activitiesData, leaderboardData] = await Promise.all([
        api.getFeed(circleData.id),
        api.getInsights(circleData.id).catch(() => null),
        api.getCircleActivity(circleData.id).catch(() => []),
        api.getLeaderboard(circleData.id).catch(() => []),
      ]);

      setFeed(feedData.posts);
      setInsights(insightsData as CircleInsights | null);
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
    } catch (e) { console.error(e); }
  }, [circle]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleManualJoin = async () => {
    setIsJoining(true);
    try {
      await api.createOrJoinCircle({ goal: 'Build a SaaS product', duration_months: 6, current_level: 'intermediate' });
      await loadData();
    } catch (e: any) { console.error(e); }
    finally { setIsJoining(false); }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={`flex-1 p-8 max-w-7xl mx-auto grid grid-cols-12 gap-8 w-full`}>
          <div className="col-span-12 lg:col-span-9 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" /></div>
            <Skeleton className="h-48" />
            <Skeleton className="h-64" />
          </div>
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Skeleton className="h-48" /><Skeleton className="h-40" /><Skeleton className="h-32" />
          </div>
        </div>
      );
    }

    if (error || !circle) {
      return (
        <div className={`flex-1 flex items-center justify-center p-6`}>
          <div className={`${COLORS.card} ${COLORS.border} border p-12 rounded-3xl text-center max-w-md`}>
            <div className="h-20 w-20 bg-[#c4a27a22] rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className={COLORS.accent} size={40} />
            </div>
            <h2 className={`${COLORS.text} text-2xl font-bold mb-2`}>Join Your First Execution Circle</h2>
            <p className={`${COLORS.textMuted} mb-8`}>You haven't been matched yet. Let us find your ideal high-performance peers.</p>
            <button
              onClick={handleManualJoin}
              disabled={isJoining}
              className={`w-full py-3 ${COLORS.accentBg} text-black font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50`}
            >
              {isJoining ? 'Matching...' : 'Find My Circle'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex-1 text-[#e8e2d9] p-4 md:p-8 w-full`}>
        {showHowItWorks && <HowItWorksModal onClose={() => setShowHowItWorks(false)} />}
        {showChangeModal && <RequestChangeModal circleId={circle.id} onClose={() => setShowChangeModal(false)} />}

        {/* Mobile Header Toggle */}
        <div className="xl:hidden flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white tracking-tight">Execution Circle</h1>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-8">
            <CircleHero circle={circle} onHowItWorks={() => setShowHowItWorks(true)} />
            <AccountabilityRow circle={circle} />
            <PerformanceSection circle={circle} />
            <FeedSection circleId={circle.id} feed={feed} onFeedUpdated={refreshFeed} />
          </div>
          <div className="lg:col-span-3">
            <CircleSidebar
              insights={insights}
              circle={circle}
              activities={activities}
              leaderboard={leaderboard}
              onRequestChange={() => setShowChangeModal(true)}
            />
          </div>
        </div>
      </div>
    );
  };

  // FIX: Wrapped in the Global Layout architecture
  return (
    <div className={`min-h-screen ${COLORS.bg} flex antialiased selection:bg-white selection:text-black`}>
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