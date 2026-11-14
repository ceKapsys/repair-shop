import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { ServiceList, ServiceRow } from "@/components/site/service-row";
import { copy, fill } from "@/content/copy";
import { getServiceCategories, getServices } from "@/lib/data";
import { priceLabel } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("services", { title: copy.service.listTitle, path: "/services", description: fill(copy.meta.servicesDesc, { city: s.contacts.city }) });
}

export default async function ServicesPage() {
  const [services, categories, s] = await Promise.all([getServices(), getServiceCategories(), getSettings()]);
  const known = new Set(categories.map((c) => c._id));
  const groups = [
    ...categories.map((c) => ({ id: c._id, name: c.name, items: services.filter((x) => x.categoryId === c._id) })),
    { id: "other", name: "", items: services.filter((x) => !x.categoryId || !known.has(x.categoryId)) },
  ].filter((g) => g.items.length);

  return (
    <>
      <PageHero
        title={copy.service.listTitle}
        intro={copy.service.priceNote}
        crumbs={<Breadcrumbs items={[{ label: copy.nav.services, href: "/services" }]} />}
      />
      <div className="container-page pb-16 md:pb-24">
        {groups.length === 0 && <p className="rounded-card border border-line bg-surface p-8 text-ink-soft">{fill(copy.misc.noServices, { phone: s.contacts.phones[0] })}</p>}
        <div className="grid gap-12">
          {groups.map((g) => (
            <section key={g.id} aria-label={g.name || copy.service.listTitle}>
              {g.name && <h2 className="mb-5">{g.name}</h2>}
              <ServiceList>
                {g.items.map((x) => (
                  <ServiceRow key={x._id} href={`/services/${x.slug}`} title={x.title} icon={x.icon} duration={x.duration} warrantyDays={x.warrantyDays} price={priceLabel(x, s.currency)} />
                ))}
              </ServiceList>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
