import type { MetadataRoute } from "next";
import { siteConfig } from "@/app/lib/seo";

const pages = [
  "/",
  "/about",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((pathname) => ({
    url: new URL(pathname, siteConfig.url).toString(),
    lastModified: new Date(),
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : 0.7,
    host: siteConfig.url,
  }));
}
