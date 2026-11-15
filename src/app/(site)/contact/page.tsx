import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { MapEmbed } from "@/components/site/map-embed";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social-links";
import { TrackedLink } from "@/components/site/tracked-link";
import { copy, fill } from "@/content/copy";
import { DAY_NAMES } from "@/lib/format";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { telLink, waLink } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { localNow } from "@/lib/time";

export const revalidate = 3600;
const c = copy.contact;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("contact", {
    title: c.title,
    path: "/contact",
    description: fill(copy.meta.contactDesc, { shop: s.shopName, city: s.contacts.city }),
  });
}

export default async function ContactPage() {
  const s = await getSettings();
  const today = localNow(s.timezone).day;
  const hours = s.hours.slice().sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7));

  return (
    <>
      <JsonLd data={localBusinessJsonLd(s)} />
      <PageHero
        eyebrow="Direct Support · Mobile Dispatch"
        title={c.title}
        intro={c.intro}
        crumbs={<Breadcrumbs items={[{ label: c.title, href: "/contact" }]} />}
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
              <span>Book Online</span>
              <ArrowRight size={16} />
            </Link>
          </>
        }
      />

      <section className="bg-bg py-12 md:py-16">
        <div className="container-page grid gap-8 lg:grid-cols-12">
          {/* Left Column: Contact Cards */}
          <div className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-7">
            <div className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Phone size={18} />
              </div>
              <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {c.phone}
              </h2>
              <div className="mt-2 flex flex-col gap-1">
                {s.contacts.phones.map((p) => (
                  <TrackedLink
                    key={p}
                    event="call_click"
                    href={telLink(p)}
                    className="num inline-flex items-center text-base font-semibold text-ink transition-colors hover:text-primary"
                  >
                    {p}
                  </TrackedLink>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
                <MessageCircle size={18} />
              </div>
              <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {c.whatsapp}
              </h2>
              <div className="mt-2">
                <TrackedLink
                  event="whatsapp_click"
                  href={waLink(s.contacts.whatsapp, fill(copy.whatsapp.home, { shop: s.shopName }))}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1.5 text-base font-semibold text-primary transition-colors hover:text-primary-strong"
                >
                  <span>{copy.whatsapp.label}</span>
                  <ArrowRight size={15} />
                </TrackedLink>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Mail size={18} />
              </div>
              <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {c.email}
              </h2>
              <div className="mt-2">
                <a
                  href={`mailto:${s.contacts.email}`}
                  className="break-all text-base font-semibold text-ink transition-colors hover:text-primary"
                >
                  {s.contacts.email}
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin size={18} />
              </div>
              <h2 className="mt-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {c.address}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink">{s.contacts.address}</p>
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 sm:col-span-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Social media
              </h2>
              <div className="mt-3 max-w-sm">
                <SocialLinks socials={s.socials} variant="contact" />
              </div>
            </div>
          </div>

          {/* Right Column: Business Hours */}
          <section aria-labelledby="hours" className="lg:col-span-5">
            <div className="rounded-2xl border border-line bg-surface p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock size={18} />
                </div>
                <h2 id="hours" className="font-heading text-xl font-bold text-ink">
                  {c.hours}
                </h2>
              </div>

              <dl className="mt-5 divide-y divide-line overflow-hidden rounded-xl border border-line bg-bg">
                {hours.map((h) => {
                  const timeDisplay =
                    h.day === 2
                      ? "7:00 AM – 11:45 PM"
                      : h.closed
                        ? c.closed
                        : "6:00 AM – 10:00 AM · 8:00 PM – 11:45 PM";
                  const isToday = h.day === today;
                  return (
                    <div
                      key={h.day}
                      className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${
                        isToday ? "bg-primary/5 font-semibold text-ink" : "text-ink-soft"
                      }`}
                    >
                      <dt className="flex items-center gap-2">
                        <span>{DAY_NAMES[h.day]}</span>
                        {isToday && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {copy.static.today}
                          </span>
                        )}
                      </dt>
                      <dd className="num text-right text-ink">{timeDisplay}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </section>

          {/* Full-width Map */}
          <div className="overflow-hidden rounded-3xl border border-line shadow-xs lg:col-span-12">
            <MapEmbed value={s.contacts.mapEmbed} title={fill(c.map, { shop: s.shopName })} />
          </div>
        </div>
      </section>
    </>
  );
}
