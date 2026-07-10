import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Our Story Behind Vector",
  description:
    "Meet Vector, the student-built platform from NIT Kurukshetra that turns vague ambitions into structured roadmaps, shared accountability, and consistent progress.",
  pathname: "/about",
  keywords: [
    "about Vector",
    "student-built startup",
    "NIT Kurukshetra",
    "AI roadmaps",
    "accountability platform",
    "goal execution",
  ],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
