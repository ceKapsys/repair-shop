import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { ModelSearch } from "@/components/site/model-search";
import { PageHero } from "@/components/site/page-hero";
import { copy, fill } from "@/content/copy";
import { getBrandBySlug, getDevicesByBrand } from "@/lib/data";
import { notFoundOrRedirect } from "@/lib/not-found";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

type Props = { params: Promise<{ brand: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [brand, s] = await Promise.all([getBrandBySlug((await params).brand), getSettings()]);
  if (!brand) return {};
  return buildMetadata(brand.seo, {
    title: fill(copy.device.brandH1, { brand: brand.name }),
    description: fill(copy.meta.brandDesc, { brand: brand.name, city: s.contacts.city }),
    path: `/devices/${brand.slug}`,
    image: brand.logo,
  });
}

export default async function BrandPage({ params }: Props) {
  const { brand: slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return notFoundOrRedirect(`/devices/${slug}`);
  const devices = await getDevicesByBrand(brand._id);

  return (
    <>
      <PageHero
        title={fill(copy.device.brandH1, { brand: brand.name })}
        intro={copy.home.picker.sub}
        crumbs={<Breadcrumbs items={[{ label: copy.nav.devices, href: "/devices" }, { label: brand.name, href: `/devices/${brand.slug}` }]} />}
      />
      <div className="container-page pb-16 md:pb-24">
        {devices.length === 0 ? (
          <p className="text-ink-soft">{copy.misc.noModels}</p>
        ) : (
          <ModelSearch brand={brand.name} models={devices.map((d) => ({ id: d._id, name: d.model, href: `/devices/${brand.slug}/${d.slug}`, year: d.releaseYear }))} />
        )}
        <p className="mt-8">
          <Link href="/book" className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:text-primary-strong hover:underline">{copy.device.notListed}</Link>
        </p>
      </div>
    </>
  );
}
