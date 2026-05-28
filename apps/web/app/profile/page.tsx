"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../lib/api";
import {
  User,
  Target,
  Calendar,
  Sparkles,
  Loader2,
  Menu,
  Save,
  PenTool,
  Bookmark,
  ChevronRight,
  Globe,
  Award,
} from "lucide-react";
import { motion } from "motion/react";

interface ProfileData {
  profile: {
    username: string;
    bio: string;
    avatarUrl: string;
    currentLevel: string;
    targetRole: string;
  };
  roadmap: {
    id: string;
    title: string;
    totalWeeks: number;
    generatedBy: string;
    goal: string;
    createdAt: string;
  } | null;
}

export default function ProfilePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  // Editable form fields
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile");
        console.log("Profile API response:", response);
        if (response.data?.success) {
          setProfileData(response.data.data);
          setUsername(response.data.data.profile.username);
          setBio(response.data.data.profile.bio);
          setAvatarUrl(response.data.data.profile.avatarUrl);
          setTargetRole(response.data.data.profile.targetRole);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setEditSuccess(false);
    try {
      const response = await api.put("/api/profile", {
        username,
        bio,
        avatarUrl,
        targetRole,
      });

      if (response.data?.success) {
        setProfileData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            profile: {
              ...prev.profile,
              username,
              bio,
              avatarUrl,
              targetRole,
            },
          };
        });
        setEditSuccess(true);
        setTimeout(() => setEditSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 25 },
    },
  } as const;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-white animate-pulse delay-75" />
            <div className="h-2 w-2 rounded-full bg-white animate-pulse delay-150" />
          </div>
          <span className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
            Fetching user parameters...
          </span>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#070b0a] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Failed to fetch profile dataset. Verify auth credentials.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
      <div className="flex">
        {/* MOBILE SIDEBAR WRAPPER */}
        <div
          className={`fixed inset-0 z-50 xl:hidden transition-all duration-300 ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-[260px] transform bg-[#0A0A0A] border-r border-zinc-900 transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        <Sidebar onNavigate={() => setMobileOpen(false)} />

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 bg-[#070b0a]">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-[1200px] mx-auto px-4 md:px-8 py-8"
          >
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-zinc-900">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                    Vector Node
                  </span>
                  <div className="h-1 w-1 rounded-full bg-zinc-600" />
                  <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase">
                    USER PROFILE
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  Parameters & Roadmaps
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5">
                  Manage your credentials, bio details, and review actively linked execution streams.
                </p>
              </div>

              {/* Mobile Sidebar Trigger */}
              <div className="xl:hidden">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* SECTIONS WRAPPER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* SECTION 1: PROFILE MANAGEMENT (LEFT & CENTER COLUMN) */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                <div className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-900/60">
                    <User className="h-5 w-5 text-zinc-400" />
                    <div>
                      <h2 className="text-lg font-bold text-white">Identity Matrix</h2>
                      <p className="text-xs text-zinc-500">Edit credentials, bio data, and user interface avatar.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveChanges} className="space-y-6">
                    {/* AVATAR SELECTOR & PREVIEW */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-zinc-900/10 border border-zinc-900/60">
                      <div className="relative h-20 w-20 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-white text-3xl font-black font-mono overflow-hidden shrink-0 shadow-lg shadow-black/40">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={username} className="h-full w-full object-cover" />
                        ) : (
                          <span className="uppercase text-zinc-400 select-none">
                            {username ? username.charAt(0) : "V"}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">Avatar Image Link</label>
                        <input
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-700 transition-all font-mono"
                        />
                        <p className="text-[10px] text-zinc-600">Provide a hosted URL for your profile avatar.</p>
                      </div>
                    </div>

                    {/* INPUT MATRIX */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">Username</label>
                        <input
                          type="text"
                          required
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">Target Role</label>
                        <input
                          type="text"
                          required
                          placeholder="Target Role"
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 transition-all"
                        />
                      </div>
                    </div>

                    {/* BIO FIELD */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">Bio Narrative</label>
                        <span className="text-[10px] font-mono text-zinc-600">{bio.length} characters</span>
                      </div>
                      <textarea
                        rows={4}
                        placeholder="Write a brief professional developer description..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-zinc-950/60 border border-zinc-800 focus:border-zinc-500 focus:outline-none rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-700 transition-all resize-none leading-relaxed"
                      />
                    </div>

                    {/* ACTIONS BAR */}
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
                      <div>
                        {editSuccess && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Data synchronized successfully.
                          </motion.span>
                        )}
                      </div>
                      
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all shadow-md shadow-white/5"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            <span>Save Profile</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>

              {/* SECTION 2: ROADMAP DETAILS (RIGHT COLUMN) */}
              <motion.div variants={itemVariants} className="space-y-6">
                <div className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-900/60">
                    <Target className="h-5 w-5 text-zinc-400" />
                    <div>
                      <h2 className="text-lg font-bold text-white">Active Roadmap</h2>
                      <p className="text-xs text-zinc-500">Metrics linked to your profile parameters.</p>
                    </div>
                  </div>

                  {!profileData.roadmap ? (
                    <div className="py-12 text-center border border-dashed border-zinc-900 rounded-xl">
                      <Bookmark className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No linked roadmap</p>
                      <p className="text-[11px] text-zinc-600 mt-1 max-w-[200px] mx-auto leading-normal">
                        Navigate to the goals setup page to synthesize your custom execution curriculum.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* GOAL COMPONENT */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500">SYNTHESIZED GOAL</span>
                        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-start gap-3">
                          <Target className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-zinc-200 leading-snug break-words">
                              {profileData.roadmap.goal}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* TITLE COMPONENT */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500">ROADMAP TITLE</span>
                        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-start gap-3">
                          <PenTool className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-white leading-normal break-words">
                              {profileData.roadmap.title}
                            </h4>
                          </div>
                        </div>
                      </div>

                      {/* STATS MATRIX */}
                      <div className="grid grid-cols-2 gap-3.5">
                        {/* WEEKS COMPONENT */}
                        <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/20">
                          <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Duration</span>
                          </div>
                          <span className="text-xl font-extrabold font-mono text-white">
                            {profileData.roadmap.totalWeeks}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-semibold font-mono ml-1">weeks</span>
                        </div>

                        {/* GENERATED BY COMPONENT */}
                        <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/20">
                          <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="text-[9px] font-bold font-mono uppercase tracking-wider">Engine</span>
                          </div>
                          <span className="text-xs font-bold text-zinc-300 block truncate leading-relaxed">
                            {profileData.roadmap.generatedBy.split(" ")[0]}
                          </span>
                          <span className="text-[8px] text-zinc-500 block truncate font-mono mt-0.5">
                            {profileData.roadmap.generatedBy.split(" ").slice(1).join(" ")}
                          </span>
                        </div>
                      </div>

                      {/* LEVEL DETAILS BAR */}
                      <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-500 font-medium">Execution Tier</span>
                          <span className="font-bold text-white font-mono uppercase flex items-center gap-1">
                            <Award className="h-3.5 w-3.5 text-emerald-400" />
                            {profileData.profile.currentLevel}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden flex">
                          <div className="h-full w-2/3 bg-white rounded-full" />
                        </div>
                      </div>

                      {/* VIEW DETAIL ACTION LINK */}
                      <button
                        onClick={() => window.location.href = "/roadmap"}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/10 hover:bg-[#0d0e12]/40 hover:border-zinc-700 text-xs font-bold text-zinc-300 hover:text-white transition-all group focus:outline-none"
                      >
                        <span>Inspect Timeline Breakdown</span>
                        <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
