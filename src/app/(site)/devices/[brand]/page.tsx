import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
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
        eyebrow={`${brand.name} Repair`}
        title={fill(copy.device.brandH1, { brand: brand.name })}
        intro={copy.home.picker.sub}
        crumbs={
          <Breadcrumbs
            items={[
              { label: copy.nav.devices, href: "/devices" },
              { label: brand.name, href: `/devices/${brand.slug}` },
            ]}
          />
        }
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
        <div className="container-page">
          {devices.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
              {copy.misc.noModels}
            </div>
          ) : (
            <ModelSearch
              brand={brand.name}
              models={devices.map((d) => ({
                id: d._id,
                name: d.model,
                href: `/devices/${brand.slug}/${d.slug}`,
                year: d.releaseYear,
              }))}
            />
          )}

          <div className="mt-10 flex flex-col justify-between gap-4 rounded-3xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-xl font-bold text-ink">
                Model not listed?
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Book online anyway and let us know your {brand.name} model in the notes.
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
