import Link from "next/link";
import { copy, fill } from "@/content/copy";
import type { SiteSettings } from "@/lib/settings";
import { ThemeToggle } from "./theme-toggle";

const f = copy.footer;
const cols = [
  { title: f.repairs, links: [["/services", f.allServices], ["/devices", copy.nav.devices], ["/emergency", f.emergencyRepair], ["/book", copy.nav.book]] },
  { title: f.company, links: [["/about", f.about], ["/reviews", f.reviews], ["/gallery", f.gallery], ["/blog", copy.nav.blog]] },
  { title: f.help, links: [["/contact", copy.nav.contact], ["/service-area", f.serviceArea], ["/privacy", f.privacy], ["/terms", f.terms]] },
] as const;

export function SiteFooter({ s }: { s: SiteSettings }) {
  const city = s.contacts.city || "Lauderhill & South Florida";

  return (
    <footer className="bg-night text-mist">
      <div className="container-page grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 font-heading text-lg font-bold text-on-primary">
            <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-on-primary font-mono text-[13px] font-semibold text-night">
              911
            </span>
            <span>{s.shopName}</span>
          </div>
          <p className="mt-3.5 max-w-[32ch] text-sm leading-relaxed text-mist">
            Doorstep and emergency repair for phones, laptops, tablets, consoles, watches and audio in {city}.
          </p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-on-primary mb-3">{c.title}</h2>
            <ul className="space-y-2">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="inline-block text-[15px] text-mist transition-colors hover:text-on-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line-strong">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-6">
          <p className="text-sm text-mist">
            {fill(f.rights, { year: new Date().getFullYear(), shop: s.shopName })}
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
