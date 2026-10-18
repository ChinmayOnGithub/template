/*
 * config.ts
 * Central site configuration and metadata generator for search engine optimization.
 * Formats canonical URLs, Open Graph schemas, and social cards from single source of truth.
 */

import type { Metadata } from "next";

export const siteConfig = {
  name: "Universal AI SaaS Starter",
  shortName: "SaaS Starter",
  description:
    "A framework-first, production-oriented starter kit for small web applications, developer tools, and scalable SaaS foundations.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: "en_US",
  author: "Chinmay",
};

export function constructMetadata({
  title,
  description = siteConfig.description,
  image = "/og-image.png",
  canonical,
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
} = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const canonicalUrl = canonical
    ? `${siteConfig.url}${canonical.startsWith("/") ? canonical : `/${canonical}`}`
    : siteConfig.url;

  return {
    title: fullTitle,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
  };
}
