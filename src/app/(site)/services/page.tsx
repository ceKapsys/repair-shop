import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Phone, ShieldCheck, Truck, Wrench, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ServicesCatalog } from "@/components/site/services-catalog";
import { copy, fill } from "@/content/copy";
import { getServiceCategories, getServices } from "@/lib/data";
import { telLink } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("services", {
    title: copy.service.listTitle,
    path: "/services",
    description: fill(copy.meta.servicesDesc, { city: s.contacts.city }),
  });
}

const SERVICE_HIGHLIGHTS = [
  { icon: Truck, label: "Doorstep Mobile Lab", value: "We come to you" },
  { icon: Clock, label: "Fast Turnaround", value: "20–45 min average" },
  { icon: ShieldCheck, label: "Parts & Labor", value: "Up to 180-day warranty" },
  { icon: Wrench, label: "Zero Risk", value: "Pay after testing" },
];

export default async function ServicesPage() {
  const [services, categories, s] = await Promise.all([
    getServices(),
    getServiceCategories(),
    getSettings(),
  ]);

  const phone = s.contacts.phones[0];

  return (
    <>
      {/* Modern Hero Banner */}
      <section className="border-b border-line bg-surface pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="container-page">
          <Breadcrumbs items={[{ label: copy.nav.services, href: "/services" }]} />

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                On-site mobile workshop · OEM-grade parts
              </span>
              <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
                {copy.service.listTitle}
              </h1>
              <p className="mt-3 text-base leading-relaxed text-ink-soft md:text-lg">
                {copy.service.priceNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
            </div>
          </div>

          {/* 4-Card Trust Strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {SERVICE_HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-line bg-bg p-4"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-soft">{label}</p>
                  <p className="truncate text-sm font-semibold text-ink">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Services Catalog */}
      <section className="bg-bg py-12 md:py-16">
        <div className="container-page">
          <ServicesCatalog
            services={services}
            categories={categories}
            currency={s.currency}
            emptyFallback={fill(copy.misc.noServices, { phone })}
          />

          {/* Bottom Diagnostic & Help Callout */}
          <div className="mt-14 flex flex-col justify-between gap-6 rounded-3xl border border-line bg-surface p-7 sm:p-9 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Free doorstep diagnostic
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Not sure which repair your device needs?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
                Book an on-site diagnostic or call us directly. Our technician will test your device at your{" "}
                {s.contacts.city} home or office and confirm the exact price before any repair begins.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/book"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
              >
                <span>Book Diagnostic</span>
                <ArrowRight size={16} />
              </Link>
              {phone && (
                <a
                  href={telLink(phone)}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-bg px-5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
                >
                  <Phone size={15} />
                  <span>Call {phone}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
