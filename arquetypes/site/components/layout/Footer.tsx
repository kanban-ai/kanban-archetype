import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const groups = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#features" },
      { label: "Preços", href: "#pricing" },
      { label: "Integrações", href: "#" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Carreiras", href: "#" },
      { label: "Contato", href: `mailto:${siteConfig.contact.email}` },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="container-section py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-400 to-brand-700 text-white"
              >
                ◆
              </span>
              <span>{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-slate-400">
              {siteConfig.description}
            </p>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 text-sm text-slate-500 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <p>
            Feito com Next.js e TailwindCSS. Pronto para produção.
          </p>
        </div>
      </div>
    </footer>
  );
}
