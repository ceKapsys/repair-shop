import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ContactMessage } from "@/components/site/contact-message";
import { JsonLd } from "@/components/site/json-ld";
import { Photo } from "@/components/site/photo";
import { ServiceList, ServiceRow } from "@/components/site/service-row";
import { TrackedLink } from "@/components/site/tracked-link";
import { copy, fill } from "@/content/copy";
import { getBrandBySlug, getDevice, getServices } from "@/lib/data";
import { repairOfferPrice, repairPriceLabel } from "@/lib/format";
import { waLink } from "@/lib/links";
import { notFoundOrRedirect } from "@/lib/not-found";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";

type Props = { params: Promise<{ brand: string; model: string }> };
const c = copy.device;

async function load(brandSlug: string, modelSlug: string) {
  const brand = await getBrandBySlug(brandSlug);
  const device = brand ? await getDevice(brand._id, modelSlug) : null;
  return { brand, device };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const [{ brand, device }, s] = await Promise.all([load(p.brand, p.model), getSettings()]);
  if (!brand || !device) return {};
  return buildMetadata(device.seo, {
    title: fill(c.h1, { brand: brand.name, model: device.model }),
    description: fill(copy.meta.deviceDesc, {
      brand: brand.name,
      model: device.model,
      city: s.contacts.city,
    }),
    path: `/devices/${brand.slug}/${device.slug}`,
    image: device.image,
  });
}

export default async function ModelPage({ params }: Props) {
  const p = await params;
  const { brand, device } = await load(p.brand, p.model);
  if (!brand || !device) return notFoundOrRedirect(`/devices/${p.brand}/${p.model}`);
  const [services, s] = await Promise.all([getServices(), getSettings()]);
  const name = `${brand.name} ${device.model}`;
  const repairById = new Map(device.repairs.map((r) => [r.serviceId, r]));
  const rows = services
    .filter((x) => repairById.has(x._id) || x.deviceIds.includes(device._id))
    .map((x) => ({ service: x, repair: repairById.get(x._id) }));
  const specs = Object.entries(device.specs ?? {}).filter(([k, v]) => k && v);
  const path = `/devices/${brand.slug}/${device.slug}`;
  const whatsappText = fill(copy.whatsapp.device, {
    shop: s.shopName,
    brand: brand.name,
    model: device.model,
  });

  return (
    <>
      <ContactMessage text={whatsappText} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": device.seo?.schemaType || "Service",
          name: fill(c.h1, { brand: brand.name, model: device.model }),
          url: `${siteDefaults.url}${path}`,
          provider: {
            "@id": `${siteDefaults.url}/#business`,
            "@type": "ElectronicsRepair",
            name: s.shopName,
            telephone: s.contacts.phones[0],
          },
          areaServed: s.serviceAreas.map((a) => a.name),
          hasOfferCatalog: rows.length
            ? {
                "@type": "OfferCatalog",
                name: fill(copy.misc.repairsFor, { model: device.model }),
                itemListElement: rows.map((r) => {
                  const amount = repairOfferPrice(r.service, r.repair);
                  return {
                    "@type": "Offer",
                    itemOffered: { "@type": "Service", name: r.service.title },
                    ...(amount != null ? { price: amount, priceCurrency: s.currency } : {}),
                  };
                }),
              }
            : undefined,
        }}
      />

      {/* Modern Hero Banner */}
      <section className="border-b border-line bg-surface pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="container-page">
          <Breadcrumbs
            items={[
              { label: copy.nav.devices, href: "/devices" },
              { label: brand.name, href: `/devices/${brand.slug}` },
              { label: device.model, href: path },
            ]}
          />

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              {device.image && (
                <div className="flex size-32 shrink-0 items-center justify-center rounded-2xl border border-line bg-bg p-3 sm:size-36">
                  <Photo
                    src={device.image}
                    alt={name}
                    width={160}
                    height={160}
                    priority
                    sizes="160px"
                    className="size-full object-contain"
                  />
                </div>
              )}
              <div className="max-w-xl">
                <span className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  {brand.name} Repair
                </span>
                <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {fill(c.h1, { brand: brand.name, model: device.model })}
                </h1>
                <p className="mt-2.5 text-base leading-relaxed text-ink-soft">
                  {fill(c.lead, { model: device.model })}
                </p>
                {device.releaseYear ? (
                  <p className="num mt-2 text-xs font-medium text-ink-soft">
                    {fill(copy.misc.released, { year: device.releaseYear })}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/emergency?device=${device._id}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-emergency px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-emergency-strong"
              >
                <Zap size={16} />
                <span>Emergency</span>
              </Link>
              <Link
                href={`/book?device=${device._id}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-strong"
              >
                <span>{copy.service.book}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-bg py-12 md:py-16">
        <div className="container-page grid gap-14">
          <section aria-label={fill(copy.misc.repairsFor, { model: device.model })}>
            {rows.length === 0 ? (
              <div className="rounded-3xl border border-line bg-surface p-7 sm:p-9">
                <p className="max-w-[60ch] text-base text-ink-soft">{c.empty}</p>
                <TrackedLink
                  event="whatsapp_click"
                  href={waLink(s.contacts.whatsapp, whatsappText)}
                  target="_blank"
                  rel="noopener"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-strong"
                >
                  <MessageCircle size={16} />
                  <span>{copy.whatsapp.label}</span>
                </TrackedLink>
              </div>
            ) : (
              <>
                <h2 className="mb-5 font-heading text-2xl font-bold text-ink">
                  {fill(copy.misc.repairsFor, { model: device.model })}
                </h2>
                <ServiceList>
                  {rows.map(({ service, repair }) => (
                    <ServiceRow
                      key={service._id}
                      href={`/book?device=${device._id}&service=${service.slug}`}
                      title={service.title}
                      icon={service.icon}
                      duration={repair?.duration || service.duration}
                      warrantyDays={service.warrantyDays}
                      price={repairPriceLabel(service, repair, s.currency)}
                    />
                  ))}
                </ServiceList>
                <p className="mt-4 text-sm leading-5 text-ink-soft">{copy.service.priceNote}</p>
              </>
            )}
          </section>

          {specs.length > 0 && (
            <section aria-labelledby="specs">
              <h2 id="specs" className="font-heading text-2xl font-bold text-ink">
                {c.specs}
              </h2>
              <dl className="mt-5 max-w-2xl divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface/60">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 px-5 py-3.5 text-sm">
                    <dt className="text-ink-soft">{k}</dt>
                    <dd className="text-right font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </section>
    </>
  );
}
