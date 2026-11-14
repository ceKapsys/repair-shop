import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { copy } from "@/content/copy";
import { siteDefaults } from "@/lib/site";
import { JsonLd } from "./json-ld";

/** Visible breadcrumb trail plus BreadcrumbList JSON-LD. The last item is the current page. */
export function Breadcrumbs({ items }: { items: { label: string; href: string }[] }) {
  const all = [{ label: copy.nav.home, href: "/" }, ...items];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: `${siteDefaults.url}${c.href}` })),
        }}
      />
      <nav aria-label="Breadcrumb" className="text-sm leading-5 text-ink-soft">
        <ol className="flex flex-wrap items-center gap-1">
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={14} aria-hidden />}
              {i === all.length - 1 ? (
                <span aria-current="page" className="text-ink">{c.label}</span>
              ) : (
                <Link href={c.href} className="hover:text-ink">{c.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
