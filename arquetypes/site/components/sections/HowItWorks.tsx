import { Section } from "@/components/ui/Section";

const steps = [
  {
    number: "01",
    title: "Clone o esqueleto",
    description:
      "Copie a pasta site/, rode npm install e tenha um ambiente pronto em segundos.",
  },
  {
    number: "02",
    title: "Personalize a marca",
    description:
      "Ajuste site-config.ts, troque cores em tailwind.config.ts e plug seus assets em public/.",
  },
  {
    number: "03",
    title: "Publique e meça",
    description:
      "Deploy em qualquer host, conecte analytics e itere baseado em dados reais de Core Web Vitals.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      eyebrow="Como funciona"
      title="Do clone à produção em três passos"
      description="Sem CLI proprietária, sem lock-in, sem mágica escondida."
    >
      <ol className="grid gap-8 md:grid-cols-3" role="list">
        {steps.map((step) => (
          <li
            key={step.number}
            className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-8"
          >
            <span className="text-sm font-semibold tracking-widest text-brand-400">
              {step.number}
            </span>
            <h3 className="mt-3 text-xl font-semibold text-white">
              {step.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
