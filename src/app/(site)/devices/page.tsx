import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { BrandTile } from "@/components/site/brand-tile";
import { PageHero } from "@/components/site/page-hero";
import { copy, fill } from "@/content/copy";
import { getAllDevices, getBrands } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import type { DeviceType } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("devices", { title: copy.device.listTitle, path: "/devices", description: fill(copy.meta.devicesDesc, { city: s.contacts.city }) });
}

export default async function DevicesPage() {
  const [brands, devices] = await Promise.all([getBrands(), getAllDevices()]);
  const count = (id: string) => devices.filter((d) => d.brandId === id).length;
  const types = (Object.keys(copy.deviceTypes) as DeviceType[]).map((t) => ({ t, items: brands.filter((b) => b.deviceType === t) })).filter((g) => g.items.length);

  return (
    <>
      <PageHero title={copy.home.picker.title} intro={copy.home.picker.sub} crumbs={<Breadcrumbs items={[{ label: copy.nav.devices, href: "/devices" }]} />} />
      <div className="container-page grid gap-12 pb-16 md:pb-24">
        {types.map(({ t, items }) => (
          <section key={t} aria-labelledby={`type-${t}`}>
            <h2 id={`type-${t}`}>{copy.deviceTypes[t]}</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((b) => (
                <li key={b._id}><BrandTile brand={b} count={count(b._id)} /></li>
              ))}
            </ul>
          </section>
        ))}
        <p className="text-ink-soft">
          <a href="/book" className="font-medium text-primary underline-offset-4 hover:text-primary-strong hover:underline">{copy.device.notListed}</a>
        </p>
      </div>
    </>
  );
}
