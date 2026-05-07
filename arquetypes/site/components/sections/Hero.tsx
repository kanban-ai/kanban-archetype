import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden border-b border-white/5 pt-24 sm:pt-32"
      aria-labelledby="hero-title"
    >
      {/* Background decorativo — não interativo, marcado aria-hidden */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-radial-fade"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern bg-[size:48px_48px] opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl animate-blob"
      />

      <div className="container-section">
        <div className="mx-auto max-w-3xl text-center">
          <a
            href="#changelog"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur transition hover:bg-white/10"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Novidade · v1.0 já disponível
            <span aria-hidden="true">→</span>
          </a>

          <h1
            id="hero-title"
            className="mt-8 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl heading-gradient animate-fade-up"
          >
            Construa landing pages que convertem em minutos, não semanas.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-slate-300 sm:text-lg animate-fade-up [animation-delay:120ms]">
            Esqueleto profissional em Next.js + TailwindCSS com SEO, performance
            e acessibilidade configurados desde o primeiro commit. Foque na sua
            mensagem — a fundação técnica já está pronta.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up [animation-delay:240ms]">
            <Button size="lg" href="#cta">
              Começar grátis
            </Button>
            <Button size="lg" variant="secondary" href="#features">
              Ver recursos
            </Button>
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>

        {/* Espaço para mockup/screenshot do produto */}
        <div className="mx-auto mt-20 max-w-5xl animate-fade-in [animation-delay:400ms]">
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-2 shadow-2xl shadow-brand-900/40 backdrop-blur">
            <div
              role="img"
              aria-label="Mockup do dashboard do produto"
              className="flex h-72 items-center justify-center rounded-xl border border-white/10 bg-slate-900/80 text-sm text-slate-500 sm:h-96"
            >
              [ Substitua por &lt;Image /&gt; com screenshot do produto ]
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
