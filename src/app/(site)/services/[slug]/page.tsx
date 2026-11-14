import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ContactMessage } from "@/components/site/contact-message";
import { FaqSection } from "@/components/site/faq-section";
import { JsonLd } from "@/components/site/json-ld";
import { Photo } from "@/components/site/photo";
import { RichHtml } from "@/components/site/rich-html";
import { PriceChip, ServiceList, ServiceRow } from "@/components/site/service-row";
import { copy, fill } from "@/content/copy";
import { getAllDevices, getBrands, getServiceBySlug, getServices } from "@/lib/data";
import { offerPrice, priceLabel } from "@/lib/format";
import { notFoundOrRedirect } from "@/lib/not-found";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";
import type { ServiceT } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
const c = copy.service;

/** "We {verb phrase} at your home or office. Most repairs take {duration}." */
function lead(service: ServiceT) {
  const verbPhrase = service.verbPhrase || `do ${service.title.toLowerCase()}`;
  return service.duration ? fill(c.lead, { verbPhrase, duration: service.duration }) : fill(c.leadNoDuration, { verbPhrase });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [service, s] = await Promise.all([getServiceBySlug(slug), getSettings()]);
  if (!service) return {};
  const vars = { what: service.title, city: s.contacts.city, duration: service.duration, warrantyDays: service.warrantyDays, phone: s.contacts.phones[0] };
  return buildMetadata(service.seo, {
    title: fill(copy.meta.serviceTitle, { service: service.title, city: s.contacts.city }),
    description: service.duration && service.warrantyDays ? fill(copy.meta.serviceDesc, vars) : fill(copy.meta.serviceDescShort, vars),
    path: `/services/${service.slug}`,
    image: service.images[0]?.url,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, s] = await Promise.all([getServiceBySlug(slug), getSettings()]);
  if (!service) return notFoundOrRedirect(`/services/${slug}`);

  const [all, devices, brands] = await Promise.all([getServices(), getAllDevices(), getBrands()]);
  const brandById = new Map(brands.map((b) => [b._id, b]));
  const supported = devices
    .filter((d) => service.deviceIds.includes(d._id) || d.repairs.some((r) => r.serviceId === service._id))
    .map((d) => ({ d, b: brandById.get(d.brandId) }))
    .filter((x) => x.b)
    .sort((a, b) => a.b!.name.localeCompare(b.b!.name) || a.d.model.localeCompare(b.d.model));
  const related = all.filter((x) => x._id !== service._id && (service.categoryId ? x.categoryId === service.categoryId : true)).slice(0, 4);
  const price = priceLabel(service, s.currency);
  const amount = offerPrice(service);
  const facts = [
    service.duration && [c.facts.time, service.duration],
    service.warrantyDays ? [c.facts.warranty, fill(c.facts.warrantyValue, { warrantyDays: service.warrantyDays })] : null,
    service.partsNote && [c.facts.parts, service.partsNote],
  ].filter(Boolean) as [string, string][];

  return (
    <>
      <ContactMessage text={fill(copy.whatsapp.service, { shop: s.shopName, service: service.title })} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": service.seo?.schemaType || "Service",
          name: service.title,
          description: service.shortDesc,
          serviceType: service.title,
          url: `${siteDefaults.url}/services/${service.slug}`,
          image: service.images[0]?.url,
          provider: { "@id": `${siteDefaults.url}/#business`, "@type": "ElectronicsRepair", name: s.shopName, telephone: s.contacts.phones[0], url: siteDefaults.url },
          areaServed: s.serviceAreas.map((a) => a.name),
          // Offers are published only when the price is visible on the page.
          offers: amount != null ? { "@type": "Offer", priceCurrency: s.currency, price: amount } : undefined,
        }}
      />
      <section className="container-page pt-8 md:pt-12">
        <Breadcrumbs items={[{ label: copy.nav.services, href: "/services" }, { label: service.title, href: `/services/${service.slug}` }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <h1 className="max-w-[18ch]">{fill(c.h1, { service: service.title, city: s.contacts.city })}</h1>
            <p className="mt-5 max-w-[60ch] text-ink-soft">{lead(service)}</p>
            {facts.length > 0 && (
              <dl className="mt-8 grid gap-x-8 gap-y-4 border-y border-line py-5 sm:grid-cols-3">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-sm leading-5 font-medium text-ink-soft">{k}</dt>
                    <dd className="mt-1 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {service.images.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {service.images.slice(0, 4).map((img, i) => (
                  <Photo
                    key={img.url}
                    src={img.url}
                    alt={img.alt}
                    width={img.width ?? 1200}
                    height={img.height ?? 800}
                    priority={i === 0}
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className={`w-full rounded-card border border-line object-cover ${i === 0 && service.images.length !== 2 ? "sm:col-span-2" : ""}`}
                  />
                ))}
              </div>
            )}
            <RichHtml html={service.body?.html} className="mt-10" />
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card bg-night p-6 text-on-primary">
              <PriceChip price={price} />
              <p className="mt-3 text-sm leading-5 text-on-primary/80">{c.priceNote}</p>
              <Link href={`/book?service=${service.slug}`} className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}>{c.book}</Link>
              {service.isEmergencyAvailable && s.emergency.enabled && (
                <Link href={`/emergency?service=${service.slug}`} className="mt-3 flex min-h-11 items-center justify-center gap-2 text-[15px] font-medium underline-offset-4 hover:underline">
                  {copy.misc.emergencyToday} {copy.home.emergencyBand.cta}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>

      <div className="container-page grid gap-16 py-16 md:py-24">
        {supported.length > 0 && (
          <section aria-labelledby="models">
            <h2 id="models">{c.devices}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {supported.map(({ d, b }) => (
                <li key={d._id}>
                  <Link href={`/devices/${b!.slug}/${d.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium hover:bg-surface">
                    {b!.name} {d.model}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <FaqSection faqs={service.faqs} title={c.faq} />
        {related.length > 0 && (
          <section aria-labelledby="related">
            <h2 id="related">{c.related}</h2>
            <div className="mt-6">
              <ServiceList>
                {related.map((x) => (
                  <ServiceRow key={x._id} href={`/services/${x.slug}`} title={x.title} icon={x.icon} duration={x.duration} warrantyDays={x.warrantyDays} price={priceLabel(x, s.currency)} />
                ))}
              </ServiceList>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
