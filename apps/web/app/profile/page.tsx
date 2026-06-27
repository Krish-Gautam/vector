"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/layout/Sidebar";
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
    nextLevel: string;
    levelProgress: number;
    goalProgress: number;
    targetRole: string;
    zoneStatus?: string;
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

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/profile");

        if (response.data?.success) {
          const profile = response.data.data.profile;

          setProfileData(response.data.data);
          setUsername(profile.username);
          setBio(profile.bio);
          setTargetRole(profile.targetRole);

          setAvatarUrl(profile.avatarUrl);
          setAvatarPreview(profile.avatarUrl);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
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
      const formData = new FormData();

      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("targetRole", targetRole);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await api.put("/api/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const profile = response.data.data.profile;

        setProfileData((prev) =>
          prev
            ? {
                ...prev,
                profile,
              }
            : null,
        );

        setAvatarUrl(profile.avatarUrl);
        setAvatarPreview(profile.avatarUrl);

        setEditSuccess(true);

        setTimeout(() => {
          setEditSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB.");
      return;
    }

    setAvatarFile(file);

    const preview = URL.createObjectURL(file);

    setAvatarPreview(preview);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 260, damping: 25 },
    },
  } as const;

  const renderContent = () => {
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
              Manage your credentials, bio details, and review actively linked
              execution streams.
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
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-[#0b0c10]/40 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-900/60">
                <User className="h-5 w-5 text-zinc-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Identity Matrix
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Edit credentials, bio data, and user interface avatar.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveChanges} className="space-y-6">
                {/* AVATAR */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    {/* Avatar */}
                    <div className="relative mx-auto sm:mx-0">
                      <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-900 shadow-lg">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt={username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-zinc-400">
                            {username ? username.charAt(0).toUpperCase() : "V"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Profile Picture
                        </h3>

                        <p className="mt-1 text-sm text-zinc-500">
                          Upload a JPG, PNG or WEBP image. Maximum size 2 MB.
                        </p>
                      </div>

                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />

                      <div className="flex flex-wrap items-center gap-3">
                        <label
                          htmlFor="avatar-upload"
                          className="cursor-pointer rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200"
                        >
                          Change Photo
                        </label>

                        {avatarFile && (
                          <span className="rounded-lg border border-emerald-700 bg-emerald-900/20 px-3 py-1 text-xs font-medium text-emerald-400">
                            {avatarFile.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* INPUT MATRIX */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      Username
                    </label>
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
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      Target Role
                    </label>
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
                    <label className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      Bio Narrative
                    </label>
                    <span className="text-[10px] font-mono text-zinc-600">
                      {bio.length} characters
                    </span>
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
                    className="flex items-center cursor-pointer gap-1.5 px-4 py-2 bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold transition-all shadow-md shadow-white/5"
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
                  <h2 className="text-lg font-bold text-white">
                    Active Roadmap
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Metrics linked to your profile parameters.
                  </p>
                </div>
              </div>

              {!profileData.roadmap ? (
                <div className="py-12 text-center border border-dashed border-zinc-900 rounded-xl">
                  <Bookmark className="h-8 w-8 text-zinc-700 mx-auto mb-3" />
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    No linked roadmap
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-1 max-w-[200px] mx-auto leading-normal">
                    Navigate to the goals setup page to synthesize your custom
                    execution curriculum.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* GOAL COMPONENT */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500">
                      SYNTHESIZED GOAL
                    </span>
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
                    <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-500">
                      ROADMAP TITLE
                    </span>
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
                        <span className="text-[9px] font-bold font-mono uppercase tracking-wider">
                          Duration
                        </span>
                      </div>
                      <span className="text-xl font-extrabold font-mono text-white">
                        {profileData.roadmap.totalWeeks}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-semibold font-mono ml-1">
                        weeks
                      </span>
                    </div>

                    {/* GENERATED BY COMPONENT */}
                    <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/20">
                      <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-bold font-mono uppercase tracking-wider">
                          Engine
                        </span>
                      </div>
                      <span className="text-xs font-bold text-zinc-300 block truncate leading-relaxed">
                        {profileData.roadmap.generatedBy.split(" ")[0]}
                      </span>
                      <span className="text-[8px] text-zinc-500 block truncate font-mono mt-0.5">
                        {profileData.roadmap.generatedBy
                          .split(" ")
                          .slice(1)
                          .join(" ")}
                      </span>
                    </div>
                  </div>

                  {/* LEVEL DETAILS BAR */}
                  <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                        Execution Tier
                      </span>
                      <span className="font-bold text-white font-mono text-xs uppercase flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <Award className="h-3.5 w-3.5" />
                        {profileData.profile.currentLevel}
                      </span>
                    </div>

                    {/* Progression bar wrapper */}
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-zinc-900/80 rounded-full overflow-hidden relative">
                        <motion.div
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{
                            width: `${profileData.profile.levelProgress}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span>
                          {profileData.profile.nextLevel !== "max"
                            ? `${profileData.profile.levelProgress}% to ${profileData.profile.nextLevel.toUpperCase()}`
                            : "Max Level Reached"}
                        </span>
                        <span>
                          Goal Progress: {profileData.profile.goalProgress}%
                        </span>
                      </div>
                    </div>

                    {/* Zone Status */}
                    {profileData.profile.zoneStatus && (
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-900/60">
                        <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-500 uppercase">
                          Zone Status
                        </span>
                        <span
                          className={`font-bold font-mono text-[10px] sm:text-xs uppercase flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${
                            profileData.profile.zoneStatus === "DANGER"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              : profileData.profile.zoneStatus === "WARNING"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              profileData.profile.zoneStatus === "DANGER"
                                ? "bg-rose-500 animate-pulse shadow-md shadow-rose-500"
                                : profileData.profile.zoneStatus === "WARNING"
                                  ? "bg-amber-500 animate-pulse shadow-md shadow-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          {profileData.profile.zoneStatus.replace("_", " ")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* VIEW DETAIL ACTION LINK */}
                  <button
                    onClick={() => (window.location.href = "/roadmap")}
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
    );
  };

  return (
    <div className="h-screen overflow-hidden font-(family-name:--font-inter) bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
      <div className="flex h-full">
        {/* MOBILE SIDEBAR MOBILE WRAPPER */}
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
        <main className="flex-1 overflow-y-auto no-scrollbar min-w-0 bg-[#070b0a]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
