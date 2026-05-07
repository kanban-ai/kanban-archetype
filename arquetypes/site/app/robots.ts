import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * robots.txt dinâmico. Bloqueie /api e endpoints internos. Mantenha
 * o sitemap apontado para a URL canônica do ambiente.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
