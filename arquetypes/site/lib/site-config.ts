/**
 * Single source of truth para metadados do site.
 * Importe daqui sempre que precisar de URL canônica, nome da marca,
 * locale ou identificadores de SEO. Evita strings espalhadas pelo código.
 */
// Usamos `||` (e não `??`) para também cair na default quando a env vier
// como string vazia — caso comum em Dockerfiles que declaram `ENV X=${ARG}`
// sem `--build-arg` correspondente.
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Acme Inc.",
  shortName: "Acme",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:8080",
  description:
    "Esqueleto profissional de landing page com Next.js, React e TailwindCSS — pronto para campanhas, captura de leads e otimização contínua.",
  tagline: "Construa landing pages que convertem em minutos, não semanas.",
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "pt_BR",
  language: "pt-BR",
  keywords: [
    "landing page",
    "next.js",
    "react",
    "tailwindcss",
    "marketing digital",
    "conversão",
    "performance web",
  ],
  authors: [{ name: "Acme Team", url: "https://example.com" }],
  creator: "Acme Team",
  publisher: "Acme Inc.",
  themeColor: "#1f45f5",
  social: {
    twitter: "@acme",
    linkedin: "https://www.linkedin.com/company/acme",
    github: "https://github.com/acme",
  },
  contact: {
    email: "contato@example.com",
    phone: "+55 11 0000-0000",
  },
  ogImage: "/og-image.png",
  analytics: {
    /** Measurement ID do GA4 (formato G-XXXXXXX). Vazio em dev/preview. */
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? "",
    /** Container ID do GTM (formato GTM-XXXXXXX). Vazio em dev/preview. */
    googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID ?? "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
