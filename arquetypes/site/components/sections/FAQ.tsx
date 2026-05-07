import { Section } from "@/components/ui/Section";

const faqs = [
  {
    q: "Posso usar isso comercialmente?",
    a: "Sim. O esqueleto é livre para uso comercial. Personalize a marca, conteúdo e deploy onde quiser.",
  },
  {
    q: "Funciona com quais hospedagens?",
    a: "Roda em qualquer host que execute Node.js: Vercel, Netlify, AWS, GCP, Azure, Fly.io, Railway, ou seu próprio servidor com Docker.",
  },
  {
    q: "Como adiciono novas páginas?",
    a: "Crie um arquivo page.tsx dentro de uma nova pasta em app/. O Next.js App Router cuida do roteamento automaticamente.",
  },
  {
    q: "E sobre internacionalização (i18n)?",
    a: "A base já está pronta para i18n via next-intl ou app router segments. Veja rules/internationalization-strategy.md.",
  },
  {
    q: "Como posso medir performance?",
    a: "Conecte Vercel Analytics, Google Analytics ou seu provedor preferido. As variáveis de ambiente já estão definidas em .env.example.",
  },
];

export function FAQ() {
  return (
    <Section
      id="faq"
      eyebrow="Perguntas frequentes"
      title="Dúvidas comuns, respostas diretas"
      description="Não encontrou o que procurava? Fale com nosso time."
    >
      <div className="mx-auto max-w-3xl divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/[0.02]">
        {faqs.map((faq) => (
          <details
            key={faq.q}
            className="group p-6 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-base font-medium text-white">
              <span>{faq.q}</span>
              <span
                aria-hidden="true"
                className="text-brand-400 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}
