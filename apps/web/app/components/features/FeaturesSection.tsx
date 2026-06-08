"use client";

import RoadmapGen from "./RoadmapGen";
import RoadmapCard from "./RoadmapCard";
import MasterDSACard from "./ProgressTrack";
import CommunityHub from "./CommunityHub";

export default function FeaturesSection() {
  return (
    <section className="w-full bg-black  pt-8 md:pt-14 ">
      {/* HEADER SECTION MATCHING THE MOCKUP */}
      <div className="mx-auto max-w-[1500px] md:px-38 mb-4 md:mb-8 px-8">
        <div className="grid md:grid-cols-2  gap-2 md:gap-8 items-end">
          <div>
            <h2 className="text-3xl md:text-5xl md:font-bold tracking-tight leading-[1.08] md:px-4">
              <span className="text-[#c7ddff] block">Everything You Need </span>
              <span className="text-[#a9c6ff]">To Stay </span>{" "}
              <span className="text-[#7fb8ff]"> Consistent </span>
              <span className="text-white block mt-1"> And Succeed</span>
            </h2>
          </div>
          <div className="flex md:justify-end">
            <p className="text-zinc-400 text-lg md:text-xl leading-relaxed max-w-[520px]">
              Create personalized roadmaps, track your progress, stay
              accountable, and connect with others pursuing the same goals — all
              powered by AI.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1500px]">
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2">
          <div className="flex min-h-[520px] flex-col  bg-black sm:min-h-[600px] md:min-h-[700px]  md:pl-38">
            <RoadmapGen />
          </div>
          <div className="flex min-h-[520px] flex-col  bg-black sm:min-h-[600px] md:min-h-[700px] md:pr-38">
            <RoadmapCard />
          </div>

          <div className="flex min-h-[520px] flex-col  bg-black sm:min-h-[600px] md:min-h-[700px] md:pl-38">
            <MasterDSACard />
          </div>

          <div className="flex min-h-[520px] flex-col bg-black sm:min-h-[600px] md:min-h-[700px] md:pr-38">
            <CommunityHub />
          </div>
        </div>
      </div>
    </section>
  );
}
