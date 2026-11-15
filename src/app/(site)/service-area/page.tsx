import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Phone, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { MapEmbed } from "@/components/site/map-embed";
import { PageHero } from "@/components/site/page-hero";
import { RichHtml } from "@/components/site/rich-html";
import { copy, fill } from "@/content/copy";
import { getPage } from "@/lib/data";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { telLink } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const c = copy.serviceArea;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("service-area", {
    title: c.title,
    path: "/service-area",
    description: fill(copy.meta.serviceAreaDesc, { shop: s.shopName, city: s.contacts.city }),
  });
}

export default async function ServiceAreaPage() {
  const [s, page] = await Promise.all([getSettings(), getPage("service-area")]);
  const phone = s.contacts.phones[0];

  return (
    <>
      <JsonLd data={localBusinessJsonLd(s)} />
      <PageHero
        eyebrow="Doorstep Mobile Coverage"
        title={c.title}
        intro={fill(c.intro, { city: s.contacts.city })}
        crumbs={<Breadcrumbs items={[{ label: c.title, href: "/service-area" }]} />}
        actions={
          <>
            <Link
              href="/emergency"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emergency px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-emergency-strong"
            >
              <Zap size={16} />
              <span>Emergency Booking</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-strong"
            >
              <span>{copy.nav.book}</span>
              <ArrowRight size={16} />
            </Link>
          </>
        }
      />

      <section className="bg-bg py-12 md:py-16">
        <div className="container-page grid gap-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {s.serviceAreas.map((a) => {
              const isHub = a.name.toLowerCase().includes("center hub") || a.slug === "margate";
              return (
                <li
                  key={a.slug}
                  className={`flex items-start gap-3.5 rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${
                    isHub
                      ? "border-primary/40 bg-primary/5 shadow-2xs"
                      : "border-line bg-surface/60 hover:border-line-strong"
                  }`}
                >
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      isHub ? "bg-primary text-on-primary" : "bg-bg text-primary"
                    }`}
                  >
                    <MapPin size={18} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2 font-heading text-base font-bold text-ink">
                      <span>{a.name}</span>
                      {isHub && (
                        <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-on-primary">
                          Main Hub
                        </span>
                      )}
                    </span>
                    {a.note && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{a.note}</p>}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Outside area callout */}
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-line bg-surface p-7 sm:flex-row sm:items-center sm:p-9">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Extended dispatch
              </p>
              <p className="mt-2 text-base leading-relaxed text-ink">
                {fill(c.outside, { phone })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/book"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
              >
                <span>{copy.nav.book}</span>
                <ArrowRight size={16} />
              </Link>
              {phone && (
                <a
                  href={telLink(phone)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-bg px-5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                >
                  <Phone size={15} />
                  <span>{phone}</span>
                </a>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-line shadow-xs">
            <MapEmbed value={s.contacts.mapEmbed} title={fill(copy.contact.map, { shop: s.shopName })} />
          </div>

          {page?.body?.html && (
            <div className="rounded-3xl border border-line bg-surface/40 p-6 sm:p-10">
              <RichHtml html={page.body.html} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
