import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { MapEmbed } from "@/components/site/map-embed";
import { PageHero } from "@/components/site/page-hero";
import { RichHtml } from "@/components/site/rich-html";
import { copy, fill } from "@/content/copy";
import { getPage } from "@/lib/data";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const c = copy.serviceArea;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("service-area", { title: c.title, path: "/service-area", description: fill(copy.meta.serviceAreaDesc, { shop: s.shopName, city: s.contacts.city }) });
}

export default async function ServiceAreaPage() {
  const [s, page] = await Promise.all([getSettings(), getPage("service-area")]);
  return (
    <>
      <JsonLd data={localBusinessJsonLd(s)} />
      <PageHero title={c.title} intro={fill(c.intro, { city: s.contacts.city })} crumbs={<Breadcrumbs items={[{ label: c.title, href: "/service-area" }]} />} />
      <div className="container-page grid gap-12 pb-16 md:pb-24">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.serviceAreas.map((a) => {
            const isHub = a.name.toLowerCase().includes("center hub") || a.slug === "margate";
            return (
              <li
                key={a.slug}
                className={`flex items-start gap-3 rounded-card p-5 ${
                  isHub
                    ? "border-2 border-primary bg-primary/5 shadow-xs"
                    : "border border-line"
                }`}
              >
                <MapPin
                  size={24}
                  strokeWidth={1.75}
                  className={`shrink-0 ${isHub ? "text-primary" : "text-steel"}`}
                  aria-hidden
                />
                <span>
                  <span className="flex items-center gap-2 font-medium text-ink">
                    <span>{a.name}</span>
                    {isHub && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-on-primary">
                        Main Hub
                      </span>
                    )}
                  </span>
                  {a.note && <span className="text-sm leading-5 text-ink-soft">{a.note}</span>}
                </span>
              </li>
            );
          })}
        </ul>
        <div>
          <p className="max-w-[60ch] text-ink-soft">{fill(c.outside, { phone: s.contacts.phones[0] })}</p>
          <Link href="/book" className={buttonVariants({ size: "lg", className: "mt-6" })}>{copy.nav.book}</Link>
        </div>
        <MapEmbed value={s.contacts.mapEmbed} title={fill(copy.contact.map, { shop: s.shopName })} />
        <RichHtml html={page?.body?.html} />
      </div>
    </>
  );
}
