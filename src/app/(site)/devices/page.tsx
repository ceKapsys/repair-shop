import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { BrandTile } from "@/components/site/brand-tile";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { copy, fill } from "@/content/copy";
import { getAllDevices, getBrands } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import type { DeviceType } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("devices", {
    title: copy.device.listTitle,
    path: "/devices",
    description: fill(copy.meta.devicesDesc, { city: s.contacts.city }),
  });
}

export default async function DevicesPage() {
  const [brands, devices] = await Promise.all([getBrands(), getAllDevices()]);
  const count = (id: string) => devices.filter((d) => d.brandId === id).length;
  const types = (Object.keys(copy.deviceTypes) as DeviceType[])
    .map((t) => ({ t, items: brands.filter((b) => b.deviceType === t) }))
    .filter((g) => g.items.length);

  return (
    <>
      <PageHero
        eyebrow="Supported Brands & Models"
        title={copy.home.picker.title}
        intro={copy.home.picker.sub}
        crumbs={<Breadcrumbs items={[{ label: copy.nav.devices, href: "/devices" }]} />}
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
        <div className="container-page grid gap-12">
          {types.map(({ t, items }) => (
            <section key={t} aria-labelledby={`type-${t}`}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 id={`type-${t}`} className="font-heading text-2xl font-bold text-ink">
                  {copy.deviceTypes[t]}
                </h2>
                <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink-soft">
                  {items.length} {items.length === 1 ? "brand" : "brands"}
                </span>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((b) => (
                  <li key={b._id}>
                    <BrandTile brand={b} count={count(b._id)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">
                Don&apos;t see your device listed?
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                We repair most smartphones and tablets on-site. Book anyway and tell us your model.
              </p>
            </div>
            <Link
              href="/book"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
            >
              <span>{copy.device.notListed}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
