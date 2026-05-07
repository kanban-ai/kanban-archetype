import { Section } from "@/components/ui/Section";

const features = [
  {
    icon: "⚡",
    title: "Performance nativa",
    description:
      "Renderização no servidor, fonts otimizadas, imagens em AVIF/WebP e Core Web Vitals verdes por padrão.",
  },
  {
    icon: "🔍",
    title: "SEO completo",
    description:
      "Metadata API, OpenGraph, Twitter Cards, JSON-LD, sitemap e robots dinâmicos — tudo já configurado.",
  },
  {
    icon: "♿",
    title: "Acessibilidade séria",
    description:
      "Skip links, foco visível, contraste AA, prefers-reduced-motion e marcação semântica em todas as seções.",
  },
  {
    icon: "🎨",
    title: "Design system pronto",
    description:
      "Tailwind configurado com tokens de marca, container, animações e componentes UI reutilizáveis.",
  },
  {
    icon: "🛡️",
    title: "Cabeçalhos seguros",
    description:
      "X-Frame-Options, CSP-friendly, Permissions-Policy e Referrer-Policy aplicados em todas as rotas.",
  },
  {
    icon: "🚀",
    title: "Deploy em qualquer lugar",
    description:
      "Roda em 0.0.0.0:8080, em containers, Vercel, AWS ou na sua infra. Zero acoplamento de plataforma.",
  },
];

export function Features() {
  return (
    <Section
      id="features"
      eyebrow="Recursos"
      title="Tudo que uma LP profissional precisa"
      description="Os fundamentos invisíveis que separam um site amador de um produto que escala."
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {features.map((feature) => (
          <li
            key={feature.title}
            className="group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-colors hover:border-brand-500/40 hover:bg-white/[0.04]"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/10 text-xl"
            >
              {feature.icon}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {feature.description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
