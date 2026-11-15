import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { RichHtml } from "@/components/site/rich-html";
import { copy, fill } from "@/content/copy";
import { getPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

/** A fixed page whose body is edited in admin (about, privacy, terms). */
export async function TextPage({
  pageKey,
  title,
  path,
  showUpdated,
}: {
  pageKey: string;
  title: string;
  path: string;
  showUpdated?: boolean;
}) {
  const page = await getPage(pageKey);
  const eyebrow = pageKey === "about" ? "Our Story & Standards" : "Legal & Policies";

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        intro={page?.intro}
        crumbs={<Breadcrumbs items={[{ label: title, href: path }]} />}
      >
        {showUpdated && page?.updatedAt && (
          <p className="mt-4 inline-flex items-center rounded-full border border-line bg-bg px-3.5 py-1 text-xs font-medium text-ink-soft">
            {fill(copy.legal.updated, { date: formatDate(page.updatedAt, { dateStyle: "long" }) })}
          </p>
        )}
      </PageHero>

      <section className="bg-bg py-12 md:py-16">
        <div className="container-page">
          <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-surface/50 p-6 sm:p-10">
            <RichHtml html={page?.body?.html} />
          </div>

          {pageKey === "about" && (
            <div className="mx-auto mt-10 flex max-w-3xl flex-col justify-between gap-5 rounded-3xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-heading text-xl font-bold text-ink">
                  Ready for a fast doorstep repair?
                </h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Book a certified technician to your home or office in under 60 seconds.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/emergency"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-emergency px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-emergency-strong"
                >
                  <Zap size={15} />
                  <span>Emergency</span>
                </Link>
                <Link
                  href="/book"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-strong"
                >
                  <span>Book Online</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
