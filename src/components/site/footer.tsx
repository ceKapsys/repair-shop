import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

const cols = [
  { title: "Repairs", links: [["/services", "All services"], ["/devices", "Devices"], ["/emergency", "Emergency repair"], ["/book", "Book a repair"]] },
  { title: "Company", links: [["/about", "About"], ["/reviews", "Reviews"], ["/gallery", "Our work"], ["/blog", "Blog"]] },
  { title: "Help", links: [["/contact", "Contact"], ["/service-area", "Service area"], ["/privacy", "Privacy"], ["/terms", "Terms"]] },
] as const;

export function SiteFooter({ s }: { s: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <p className="font-heading text-lg font-extrabold">{s.shopName}</p>
          <p className="mt-2 text-sm text-muted">{s.contacts.address}</p>
          <p className="mt-1 text-sm text-muted">{s.contacts.phones[0]} · {s.contacts.email}</p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h2 className="text-sm font-semibold">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {c.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-border px-4 py-6 text-center text-xs text-muted">
        © {new Date().getFullYear()} {s.shopName}. All rights reserved.
      </p>
    </footer>
  );
}
