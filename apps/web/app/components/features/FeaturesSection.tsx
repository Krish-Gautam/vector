"use client";

import RoadmapGen from "./RoadmapGen";
import RoadmapCard from "./RoadmapCard";
import MasterDSACard from "./ProgressTrack";
import CommunityHub from "./CommunityHub";

export default function FeaturesSection() {
  return (
    <section className="w-full bg-black px-12 md:px-38 pt-14 ">
      {/* HEADER SECTION MATCHING THE MOCKUP */}
      <div className="mx-auto max-w-[1500px] mb-8 px-8">
        <div className="grid md:grid-cols-2 gap-8 items-end">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.08] px-4">
              <span className="text-[#c7ddff] block">Everything You</span>
              <span className="text-[#a9c6ff]">Need To</span>{" "}
              <span className="text-[#7fb8ff]">Stay Consistent</span>
              <span className="text-white block mt-1">And Succeed</span>
            </h2>
          </div>
          <div className="flex md:justify-end">
            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-[520px]">
             Create personalized roadmaps, track your progress, stay accountable, and connect with others pursuing the same goals — all powered by AI.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px]  ">

        <div className="grid md:grid-cols-2 ">

          <RoadmapGen />

          <RoadmapCard />

          <MasterDSACard />

          <CommunityHub />

        </div>
      </div>
    </section>
  );
}