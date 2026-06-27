"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../components/layout/Sidebar";
import RoadmapPage from "./RoadmapPage";
import RoadmapSkeleton from "./RoadmapSkeleton";
import api from "../lib/api";
import { useAuth } from "../providers/AuthProvider";

type RoadmapData = {
  success: boolean;
  data: {
    roadmap: {
      id: string;
      title: string;
      createdAt: string;
    };
    goal: {
      id: string;
      title: string;
      currentLevel: string;
    };
    phases: Array<{
      id: string;
      title: string;
      description: string;
      estimated_days: number;
      phase_order: number;
      status: string;
      tasks: Array<{
        id: string;
        title: string;
        description: string;
        estimated_minutes: number;
        progress_minutes: number;
        difficulty: "EASY" | "MEDIUM" | "HARD";
        task_order: number;
        completed: boolean;
      }>;
    }>;
  };
};

export default function RoadmapGate() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (user && !user.email_confirmed_at) {
      router.replace(`/verify-email?email=${encodeURIComponent(user.email ?? "")}`);
      return;
    }

    let active = true;

    const loadRoadmap = async () => {
      try {
        const response = await api.get("/api/roadmap");

        if (!active) return;

        setRoadmapData(response.data);
        setChecking(false);
      } catch (err) {
        const message =
          typeof err === "object" && err && "response" in err
            ? (err as { response?: { data?: { error?: string } } }).response
                ?.data?.error
            : null;

        const isMissingRoadmap =
          message?.toLowerCase().includes("no roadmap") ||
          message?.toLowerCase().includes("no goal");

        if (!active) return;

        if (isMissingRoadmap) {
          router.replace("/onboarding");
          return;
        }

        console.error("Failed to load roadmap:", err);
        setError("Failed to load roadmap. Please verify connections.");
        setChecking(false);
      }
    };

    loadRoadmap();

    return () => {
      active = false;
    };
  }, [authLoading, router, user]);

  const renderContent = () => {
    if (authLoading || checking) {
      return <RoadmapSkeleton />;
    }

    if (error || !roadmapData) {
      return (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] text-zinc-400 font-mono text-sm">
          {error || "Failed to load roadmap. Please verify connections."}
        </div>
      );
    }

    return (
      <RoadmapPage
        roadmapData={roadmapData}
        embedded
        onOpenMobile={() => setMobileOpen(true)}
      />
    );
  };

  return (
      <div className="h-screen overflow-hidden  font-(family-name:--font-inter) bg-[#070b0a] text-zinc-200 antialiased selection:bg-white selection:text-black">
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
          <main className="flex-1 no-scrollbar min-w-0 overflow-y-auto bg-[#070b0a]">
            {renderContent()}
          </main>
        </div>
      </div>
    );
}
