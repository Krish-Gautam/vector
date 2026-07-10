import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Generating Your Roadmap",
  description:
    "Watch Vector generate your roadmap, milestone plan, daily tasks, and execution-circle match while it processes your goal.",
  pathname: "/generating",
  keywords: [
    "roadmap generation",
    "AI milestone planner",
    "daily tasks",
    "study roadmap",
    "execution circle match",
    "goal processing",
  ],
  noIndex: true,
});

export default function GeneratingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
