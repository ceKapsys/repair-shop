import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { RichHtml } from "@/components/site/rich-html";
import { copy, fill } from "@/content/copy";
import { getPage } from "@/lib/data";
import { formatDate } from "@/lib/format";

/** A fixed page whose body is edited in admin (about, privacy, terms). */
export async function TextPage({ pageKey, title, path, showUpdated }: { pageKey: string; title: string; path: string; showUpdated?: boolean }) {
  const page = await getPage(pageKey);
  return (
    <>
      <PageHero title={title} intro={page?.intro} crumbs={<Breadcrumbs items={[{ label: title, href: path }]} />}>
        {showUpdated && page?.updatedAt && <p className="mt-4 text-sm leading-5 text-ink-soft">{fill(copy.legal.updated, { date: formatDate(page.updatedAt, { dateStyle: "long" }) })}</p>}
      </PageHero>
      <div className="container-page pb-16 md:pb-24">
        <RichHtml html={page?.body?.html} />
      </div>
    </>
  );
}
