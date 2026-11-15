import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
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
  const meta = await buildMetadata(post.seo, {
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage?.url,
  });
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.publishAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return notFoundOrRedirect(`/blog/${slug}`);
  const [s, categories, all] = await Promise.all([
    getSettings(),
    getPostCategories(),
    getPosts(),
  ]);
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
          image: post.coverImage?.url
            ? post.coverImage.url.startsWith("/")
              ? `${siteDefaults.url}${post.coverImage.url}`
              : post.coverImage.url
            : undefined,
          datePublished: post.publishAt,
          dateModified: post.updatedAt ?? post.publishAt,
          mainEntityOfPage: url,
          author: { "@type": "Organization", name: s.shopName, url: siteDefaults.url },
          publisher: {
            "@type": "Organization",
            name: s.shopName,
            logo: s.branding.logo ? { "@type": "ImageObject", url: s.branding.logo } : undefined,
          },
        }}
      />

      <article>
        {/* Article Hero Header */}
        <header className="border-b border-line bg-surface pt-8 pb-12 md:pt-12 md:pb-16">
          <div className="container-page">
            <Breadcrumbs
              items={[
                { label: copy.nav.blog, href: "/blog" },
                { label: post.title, href: `/blog/${post.slug}` },
              ]}
            />
            <div className="mt-6 max-w-3xl">
              {cats.length > 0 && (
                <ul className="mb-4 flex flex-wrap gap-2" aria-label={copy.static.postedIn}>
                  {cats.map((c) => (
                    <li key={c._id}>
                      <Link
                        href={`/blog/category/${c.slug}`}
                        className="inline-flex h-7 items-center rounded-full border border-line bg-bg px-3 text-xs font-semibold text-primary hover:border-primary/40"
                      >
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-sm font-medium text-ink-soft">
                {post.publishAt ? (
                  <time dateTime={post.publishAt}>
                    {formatDate(post.publishAt, { dateStyle: "long" })}
                  </time>
                ) : null}
                {post.readingTime ? ` · ${fill(copy.blog.minutes, { minutes: post.readingTime })}` : null}
              </p>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <div className="bg-bg py-12 md:py-16">
          <div className="container-page">
            <div className="mx-auto max-w-3xl">
              {post.coverImage?.url && (
                <Photo
                  src={post.coverImage.url}
                  alt={post.coverImage.alt}
                  width={post.coverImage.width ?? 1200}
                  height={post.coverImage.height ?? 800}
                  priority
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="mb-10 aspect-[3/2] w-full rounded-3xl border border-line object-cover shadow-xs"
                />
              )}

              <RichHtml html={post.body?.html} />

              <div className="mt-12 flex flex-col justify-between gap-5 rounded-3xl border border-line bg-surface p-7 sm:flex-row sm:items-center">
                <div className="max-w-md">
                  <p className="font-heading text-xl font-bold text-ink">{copy.home.final.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                    {fill(copy.home.final.body, { phone: s.contacts.phones[0] })}
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
                    <span>{copy.nav.book}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section aria-labelledby="more" className="border-t border-line bg-surface py-12 md:py-16">
          <div className="container-page">
            <h2 id="more" className="font-heading text-2xl font-bold text-ink">
              {copy.home.blog.title}
            </h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {more.map((p) => (
                <li key={p._id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
