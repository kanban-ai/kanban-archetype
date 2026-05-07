"use client";

import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section
      id="cta"
      aria-labelledby="cta-title"
      className="relative isolate overflow-hidden py-20 sm:py-28"
    >
      <div className="container-section">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/20 via-brand-700/10 to-transparent p-10 text-center shadow-2xl shadow-brand-900/40 sm:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-500/40 blur-3xl"
          />

          <h2
            id="cta-title"
            className="text-balance text-3xl font-bold tracking-tight sm:text-4xl heading-gradient"
          >
            Pronto para colocar sua próxima LP no ar?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base text-slate-300">
            Comece grátis, sem cartão de crédito. Faça deploy em minutos e meça
            resultados desde o primeiro visitante.
          </p>

          <form
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Cadastro para começar grátis"
          >
            <label htmlFor="cta-email" className="sr-only">
              Seu melhor e-mail
            </label>
            <input
              id="cta-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="seu@email.com"
              className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/40"
            />
            <Button type="submit" size="md">
              Começar grátis
            </Button>
          </form>

          <p className="mt-4 text-xs text-slate-500">
            Ao continuar, você concorda com nossos termos de uso e política de
            privacidade.
          </p>
        </div>
      </div>
    </section>
  );
}
