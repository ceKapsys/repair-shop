import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
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
    description: fill(copy.meta.deviceDesc, { brand: brand.name, model: device.model, city: s.contacts.city }),
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
  const whatsappText = fill(copy.whatsapp.device, { shop: s.shopName, brand: brand.name, model: device.model });

  return (
    <>
      <ContactMessage text={whatsappText} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": device.seo?.schemaType || "Service",
          name: fill(c.h1, { brand: brand.name, model: device.model }),
          url: `${siteDefaults.url}${path}`,
          provider: { "@id": `${siteDefaults.url}/#business`, "@type": "ElectronicsRepair", name: s.shopName, telephone: s.contacts.phones[0] },
          areaServed: s.serviceAreas.map((a) => a.name),
          hasOfferCatalog: rows.length
            ? {
                "@type": "OfferCatalog",
                name: fill(copy.misc.repairsFor, { model: device.model }),
                itemListElement: rows.map((r) => {
                  const amount = repairOfferPrice(r.service, r.repair);
                  return { "@type": "Offer", itemOffered: { "@type": "Service", name: r.service.title }, ...(amount != null ? { price: amount, priceCurrency: s.currency } : {}) };
                }),
              }
            : undefined,
        }}
      />
      <section className="container-page pt-8 md:pt-12">
        <Breadcrumbs items={[{ label: copy.nav.devices, href: "/devices" }, { label: brand.name, href: `/devices/${brand.slug}` }, { label: device.model, href: path }]} />
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
          {device.image && <Photo src={device.image} alt={name} width={160} height={160} priority sizes="160px" className="size-32 object-contain sm:size-40" />}
          <div>
            <h1 className="max-w-[18ch]">{fill(c.h1, { brand: brand.name, model: device.model })}</h1>
            <p className="mt-4 text-ink-soft">{fill(c.lead, { model: device.model })}</p>
            {device.releaseYear ? <p className="num mt-2 text-ink-soft">{fill(copy.misc.released, { year: device.releaseYear })}</p> : null}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-16 py-10 md:py-16">
        <section aria-label={fill(copy.misc.repairsFor, { model: device.model })}>
          {rows.length === 0 ? (
            <div className="rounded-card border border-line bg-surface p-6 md:p-8">
              <p className="max-w-[60ch]">{c.empty}</p>
              <TrackedLink event="whatsapp_click" href={waLink(s.contacts.whatsapp, whatsappText)} target="_blank" rel="noopener" className={buttonVariants({ className: "mt-5" })}>
                {copy.whatsapp.label}
              </TrackedLink>
            </div>
          ) : (
            <>
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
              <Link href={`/book?device=${device._id}`} className={buttonVariants({ size: "lg", className: "mt-6" })}>{copy.service.book}</Link>
            </>
          )}
        </section>

        {specs.length > 0 && (
          <section aria-labelledby="specs">
            <h2 id="specs">{c.specs}</h2>
            <dl className="mt-6 max-w-2xl divide-y divide-line rounded-card border border-line">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 px-5 py-3">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>
    </>
  );
}
