import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { label: "Recursos", href: "#features" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Depoimentos", href: "#testimonials" },
  { label: "Preços", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
      <nav
        aria-label="Navegação principal"
        className="container-section flex h-16 items-center justify-between"
      >
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-lg shadow-brand-600/30"
          >
            ◆
          </span>
          <span className="text-base">{siteConfig.name}</span>
        </Link>

        <ul className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="transition-colors hover:text-white"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" href="#login">
            Entrar
          </Button>
          <Button variant="primary" size="sm" href="#cta">
            Começar grátis
          </Button>
        </div>
      </nav>
    </header>
  );
}
