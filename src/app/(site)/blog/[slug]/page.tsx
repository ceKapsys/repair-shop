import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { Photo } from "@/components/site/photo";
import { PostCard } from "@/components/site/post-card";
import { RichHtml } from "@/components/site/rich-html";
import { copy, fill } from "@/content/copy";
import { getPostBySlug, getPostCategories, getPosts } from "@/lib/data";
import { formatDate } from "@/lib/format";
import { notFoundOrRedirect } from "@/lib/not-found";
import { buildMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug((await params).slug);
  if (!post) return {};
  const meta = await buildMetadata(post.seo, { title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, image: post.coverImage?.url });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article", publishedTime: post.publishAt, modifiedTime: post.updatedAt } };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFoundOrRedirect(`/blog/${slug}`);
  const [s, categories, all] = await Promise.all([getSettings(), getPostCategories(), getPosts()]);
  const cats = categories.filter((c) => post.categoryIds.includes(c._id));
  const more = all.filter((p) => p._id !== post._id).slice(0, 3);
  const url = `${siteDefaults.url}/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": post.seo?.schemaType || "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImage?.url ? (post.coverImage.url.startsWith("/") ? `${siteDefaults.url}${post.coverImage.url}` : post.coverImage.url) : undefined,
          datePublished: post.publishAt,
          dateModified: post.updatedAt ?? post.publishAt,
          mainEntityOfPage: url,
          author: { "@type": "Organization", name: s.shopName, url: siteDefaults.url },
          publisher: { "@type": "Organization", name: s.shopName, logo: s.branding.logo ? { "@type": "ImageObject", url: s.branding.logo } : undefined },
        }}
      />
      <article className="container-page pt-8 pb-16 md:pt-12 md:pb-24">
        <Breadcrumbs items={[{ label: copy.nav.blog, href: "/blog" }, { label: post.title, href: `/blog/${post.slug}` }]} />
        <header className="mt-6 max-w-[var(--container-text)]">
          <h1 className="text-[36px] leading-10 md:text-[44px] md:leading-[52px]">{post.title}</h1>
          <p className="mt-4 text-sm leading-5 text-ink-soft">
            {post.publishAt ? <time dateTime={post.publishAt}>{formatDate(post.publishAt, { dateStyle: "long" })}</time> : null}
            {post.readingTime ? ` · ${fill(copy.blog.minutes, { minutes: post.readingTime })}` : null}
          </p>
          {cats.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2" aria-label={copy.static.postedIn}>
              {cats.map((c) => (
                <li key={c._id}><Link href={`/blog/category/${c.slug}`} className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm font-medium hover:bg-surface">{c.name}</Link></li>
              ))}
            </ul>
          )}
        </header>
        {post.coverImage?.url && (
          <Photo src={post.coverImage.url} alt={post.coverImage.alt} width={post.coverImage.width ?? 1200} height={post.coverImage.height ?? 800} priority sizes="(min-width: 768px) 680px, 100vw" className="mt-8 aspect-[3/2] w-full max-w-[var(--container-text)] rounded-card border border-line object-cover" />
        )}
        <RichHtml html={post.body?.html} className="mt-10" />
        <div className="mt-12 max-w-[var(--container-text)] rounded-card bg-surface p-6">
          <p className="font-medium">{copy.home.final.title}</p>
          <p className="mt-1 text-ink-soft">{fill(copy.home.final.body, { phone: s.contacts.phones[0] })}</p>
          <Link href="/book" className={buttonVariants({ className: "mt-5" })}>{copy.nav.book}</Link>
        </div>
      </article>
      {more.length > 0 && (
        <section aria-labelledby="more" className="bg-surface">
          <div className="container-page section-y">
            <h2 id="more">{copy.home.blog.title}</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((p) => <li key={p._id}><PostCard post={p} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
