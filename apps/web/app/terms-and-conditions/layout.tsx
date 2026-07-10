import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Terms for Using Vector",
  description:
    "Read the terms for using Vector's AI roadmaps, accountability circles, progress tracking, subscriptions, and user-generated content.",
  pathname: "/terms-and-conditions",
  keywords: [
    "Vector terms and conditions",
    "platform terms",
    "AI roadmap service",
    "subscription terms",
    "community guidelines",
    "user content rights",
  ],
});

export default function TermsAndConditionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
