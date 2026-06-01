"use client";

import { useState } from "react";

import HeroSection from "./components/HeroSection";
import MembersSection from "./components/MembersSection";
import MotivationCard from "./components/MotivationCard";
import RightRail from "./components/RightRail";
import Sidebar from "../components/layout/Sidebar";
import StatsSection from "./components/StatsSection";
import Topbar from "./components/Topbar";

export default function ExecutionCirclePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06070B] text-white">
      <div className="flex">
        {/* MOBILE SIDEBAR */}
        <div
          className={`fixed inset-0 z-50 xl:hidden transition ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          <div
            className={`absolute left-0 top-0 h-full w-[280px] transform bg-[#0B0B12] transition-transform duration-300 ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar variant="mobile" onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        {/* DESKTOP SIDEBAR */}
        <Sidebar onNavigate={() => setMobileOpen(false)} />

        {/* MAIN */}
        <main className="flex-1">
          <Topbar onMenuClick={() => setMobileOpen(true)} />

          {/* CONTENT */}
          <div className="grid gap-6 p-4 md:p-8 2xl:grid-cols-[1fr_360px]">
            {/* LEFT */}
            <div className="space-y-6">
              {/* HERO */}
              <HeroSection />

              {/* MEMBERS */}
              <MembersSection />

              {/* STATS */}
              <StatsSection />

              {/* MOTIVATION CARD */}
              <MotivationCard />
            </div>

            {/* RIGHT SIDEBAR */}
            <RightRail />
          </div>
        </main>
      </div>
    </div>
  );
}