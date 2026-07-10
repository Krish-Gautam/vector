import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "How Vector Handles Your Data",
  description:
    "See how Vector collects, uses, stores, and protects the data behind personalized AI roadmaps, progress tracking, and organization features.",
  pathname: "/privacy-policy",
  keywords: [
    "Vector privacy policy",
    "data protection",
    "AI roadmap data",
    "account security",
    "privacy controls",
    "community data",
  ],
});

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
