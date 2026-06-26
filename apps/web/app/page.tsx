// app/components/CodeNestHero.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { ArrowRight, Menu, X } from "lucide-react";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import FeaturesSection from "./components/features/FeaturesSection";
import Link from "next/link";

const navItems = ["PROJECTS", "BLOG", "ABOUT", "RESUME"];

export default function CodeNestHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const videoSrc =
      "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";

    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoSrc;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: false,
      });

      hls.loadSource(videoSrc);
      hls.attachMedia(video);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#06060f] text-white">
      <Navbar />
      {/* ================= VIDEO ================= */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />

      {/* Left Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#06060f] via-[#06060fd9] to-transparent" />

      {/* Bottom Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06060f] via-[#06060f80] to-transparent" />

      {/* ================= GRID LINES ================= */}
      <div className="pointer-events-none absolute inset-0 hidden md:block">
        <div className="absolute left-1/4 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-white/10" />
      </div>

      {/* ================= HERO ================= */}
      <section className="relative  flex min-h-[50vh] md:min-h-screen items-center">
        <div className="mx-auto flex w-full max-w-7xl flex-col px-6 pt-32 pb-20 text-center md:text-left md:px-10">
          {/* Eyebrow */}
          <span className="mb-5 text-[11px] font-(family-name:--font-inter) font-bold uppercase tracking-[0.2em] text-[#7fb8ff]">
            Career-Ready Curriculum
          </span>

          {/* Headline */}
          <div className="max-w-5xl text-[30px] font-bold font-(family-name:--font-inter) uppercase leading-[0.95] tracking-tight sm:text-[52px] md:text-[64px] lg:text-[72px]">
            Stop Planning. <br />
            Start Executing
            <span className="text-[#7fb8ff]">.</span>
          </div>

          {/* Description */}
          <p className="mt-7 font-(family-name:--font-inter) max-w-[512px] text-[14px] leading-7 text-white/70 md:text-[15px]">
            Vector bridges the gap between ambition and execution by helping
            students stay consistent, track progress, and achieve career goals
            with structured guidance and AI-powered recommendations.
          </p>


          {/* CTA */}
          <div className="mt-10 flex gap-2">
            <Link
              href="/roadmap"
              className="inline-flex font-(family-name:--font-inter) items-center gap-3 rounded-full bg-[#4f8cff] px-4 py-3 md:px-7 md:py-4 text-sm md:font-bold uppercase tracking-wide text-[#06060f] transition-all duration-300 hover:scale-[1.02] hover:bg-[#3f78e6]"
            >
              Start for free
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            </Link>
            <Link
              href="/plus"
              className="inline-flex font-(family-name:--font-inter) items-center gap-3 rounded-full border-3 border-[#7fb8ff]/40 px-4 py-3 md:px-7 md:py-4 text-sm md:font-bold uppercase tracking-wide text-[#7fb8ff] transition-all duration-300 hover:scale-[1.02] hover:bg-[#7fb8ff]/10"
            >
              Explore Plus
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={18} strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </section>
      <section className="relative z-10  flex min-h-screen items-center">
        <FeaturesSection />
      </section>

      <div className="relative z-10">
        <Footer />
      </div>
    </main>
  );
}
