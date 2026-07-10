import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/signin",
          "/roadmap/",
          "/profile/",
          "/onboarding/",
          "/generating/",
          "/verify-email/",
          "/reset-password",
          "/callback",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
