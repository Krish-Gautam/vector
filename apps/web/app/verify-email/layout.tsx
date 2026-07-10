import type { Metadata } from "next";
import { createPageMetadata } from "@/app/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Verify Your Vector Email",
  description:
    "Confirm your Vector account email to finish signup and continue to onboarding or your dashboard.",
  pathname: "/verify-email",
  keywords: [
    "verify email",
    "account confirmation",
    "Vector signup",
    "email verification",
    "onboarding access",
    "account activation",
  ],
  noIndex: true,
});


export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
