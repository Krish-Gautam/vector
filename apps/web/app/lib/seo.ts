import type { Metadata } from "next";

export const siteConfig = {
  name: "Vector",
  url: "https://vectorai.me",
  description:
    "Vector helps students and ambitious builders turn goals into AI-powered roadmaps, daily tasks, and accountability systems.",
  ogImage: "/vector1.png",
} as const;

type PageMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  keywords: string[];
  noIndex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  pathname,
  keywords,
  noIndex = false,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: pathname,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title,
      description,
      url: pathname,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

export function createNoIndexMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo2.png`,
  description: siteConfig.description,
} as const;

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
} as const;
