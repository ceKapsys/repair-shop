import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { MapEmbed } from "@/components/site/map-embed";
import { PageHero } from "@/components/site/page-hero";
import { TrackedLink } from "@/components/site/tracked-link";
import { copy, fill } from "@/content/copy";
import { DAY_NAMES } from "@/lib/format";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { telLink, waLink } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { localNow } from "@/lib/time";
import { SocialLinks } from "@/components/site/social-links";

export const revalidate = 3600;
const c = copy.contact;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("contact", { title: c.title, path: "/contact", description: fill(copy.meta.contactDesc, { shop: s.shopName, city: s.contacts.city }) });
}

export default async function ContactPage() {
  const s = await getSettings();
  const today = localNow(s.timezone).day;
  const link = "inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:text-primary-strong hover:underline";
  // Monday first
  const hours = s.hours.slice().sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));
  return (
    <>
      <JsonLd data={localBusinessJsonLd(s)} />
      <PageHero title={c.title} intro={c.intro} crumbs={<Breadcrumbs items={[{ label: c.title, href: "/contact" }]} />} />
      <div className="container-page grid gap-12 pb-16 md:grid-cols-2 md:pb-24">
        <dl className="grid content-start gap-6">
          <div>
            <dt className="text-sm leading-5 font-medium text-ink-soft">{c.phone}</dt>
            {s.contacts.phones.map((p) => (
              <dd key={p}><TrackedLink event="call_click" href={telLink(p)} className={`${link} num`}>{p}</TrackedLink></dd>
            ))}
          </div>
          <div>
            <dt className="text-sm leading-5 font-medium text-ink-soft">{c.whatsapp}</dt>
            <dd>
              <TrackedLink event="whatsapp_click" href={waLink(s.contacts.whatsapp, fill(copy.whatsapp.home, { shop: s.shopName }))} target="_blank" rel="noopener" className={link}>{copy.whatsapp.label}</TrackedLink>
            </dd>
          </div>
          <div>
            <dt className="text-sm leading-5 font-medium text-ink-soft">{c.email}</dt>
            <dd><a href={`mailto:${s.contacts.email}`} className={link}>{s.contacts.email}</a></dd>
          </div>
          <div>
            <dt className="text-sm leading-5 font-medium text-ink-soft">{c.address}</dt>
            <dd className="mt-2 max-w-[40ch]">{s.contacts.address}</dd>
          </div>
          <div>
            <dt className="text-sm leading-5 font-medium text-ink-soft mb-2">Social media</dt>
            <dd className="max-w-xs">
              <SocialLinks socials={s.socials} variant="contact" />
            </dd>
          </div>
        </dl>
        <section aria-labelledby="hours">
          <h2 id="hours">{c.hours}</h2>
          <dl className="mt-6 divide-y divide-line rounded-card border border-line">
            {hours.map((h) => {
              const timeDisplay =
                h.day === 2
                  ? "7:00 AM – 11:45 PM"
                  : h.closed
                    ? c.closed
                    : "6:00 AM – 10:00 AM · 8:00 PM – 11:45 PM";
              return (
                <div key={h.day} className={`flex justify-between gap-6 px-5 py-3 ${h.day === today ? "bg-surface font-medium" : ""}`}>
                  <dt>{DAY_NAMES[h.day]}{h.day === today ? <span className="sr-only"> ({copy.static.today})</span> : null}</dt>
                  <dd className="num text-right">{timeDisplay}</dd>
                </div>
              );
            })}
          </dl>
        </section>
        <div className="md:col-span-2">
          <MapEmbed value={s.contacts.mapEmbed} title={fill(c.map, { shop: s.shopName })} />
        </div>
      </div>
    </>
  );
}
