import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Circle Leaderboard and Rankings",
  description:
    "View the circle leaderboard to compare points, streaks, accountability scores, and weekly rankings inside your execution circle.",
  pathname: "/leaderboard",
  keywords: [
    "circle leaderboard",
    "accountability rankings",
    "points leaderboard",
    "streaks",
    "execution circle rankings",
    "peer progress",
  ],
});

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
