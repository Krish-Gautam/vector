import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Execution Circle Accountability Hub",
  description:
    "Join an execution circle in Vector to track shared goals, weekly activity, health score, and leaderboard momentum with peers who stay accountable together.",
  pathname: "/execution-circle",
  keywords: [
    "execution circle",
    "accountability hub",
    "shared goals",
    "health score",
    "circle leaderboard",
    "peer accountability",
  ],
});

export default function ExecutionCircleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
