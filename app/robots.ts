/*
 * robots.ts
 * Next.js native crawler directive generator.
 * Protects private workspace endpoints while indexing public landing and legal resources.
 */

import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/cookies"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/settings",
          "/settings/*",
          "/api/*",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
