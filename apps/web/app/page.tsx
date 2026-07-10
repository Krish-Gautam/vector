import type { Metadata } from "next";
import HomeHeroClient from "./components/home/HomeHeroClient";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "AI Goal Tracking for Students and Builders",
  description:
    "Vector helps students and ambitious builders turn goals into AI-powered roadmaps, daily tasks, execution circles, and consistent progress.",
  pathname: "/",
  keywords: [
    "AI goal tracking",
    "student productivity",
    "career roadmap",
    "accountability circles",
    "daily tasks",
    "goal execution",
  ],
});

export default function HomePage() {
  return <HomeHeroClient />;
}
