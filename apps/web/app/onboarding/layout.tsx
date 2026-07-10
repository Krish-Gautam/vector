import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Build Your Personalized Roadmap",
  description:
    "Tell Vector your goal, skill level, timeline, and daily commitment so it can generate a personalized roadmap around your pace.",
  pathname: "/onboarding",
  keywords: [
    "roadmap onboarding",
    "goal setting",
    "AI roadmap generator",
    "daily commitment",
    "study plan setup",
    "personalized roadmap",
  ],
  noIndex: true,
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
