import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

/**
 * Sitemap dinâmico do Next.js (App Router). Adicione novas rotas no array
 * `routes` à medida que páginas forem publicadas. Use `lastModified`
 * dinâmico quando integrar com CMS.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
  ];

  const now = new Date();

  return routes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
