import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { PostCard } from "@/components/site/post-card";
import { copy } from "@/content/copy";
import type { CategoryT, PostT } from "@/lib/types";

/** Blog listing, shared by /blog and /blog/category/[slug]. The first post is shown larger. */
export function BlogIndex({
  posts,
  categories,
  active,
  title,
  intro,
  crumbs,
}: {
  posts: PostT[];
  categories: CategoryT[];
  active?: string;
  title: string;
  intro?: string;
  crumbs: { label: string; href: string }[];
}) {
  const chip = (on: boolean) =>
    `inline-flex h-9 items-center rounded-full border px-4 text-xs font-semibold transition-colors ${
      on
        ? "border-primary bg-primary text-on-primary"
        : "border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink"
    }`;
  const used = categories.filter(
    (c) => c._id === active || posts.some((p) => p.categoryIds.includes(c._id)) || !active
  );

  return (
    <>
      <PageHero
        eyebrow="Repair Guides & Tips"
        title={title}
        intro={intro}
        crumbs={<Breadcrumbs items={crumbs} />}
      />
      <section className="bg-bg py-12 md:py-16">
        <div className="container-page">
          {used.length > 0 && (
            <nav aria-label={copy.static.postedIn} className="mb-10 flex flex-wrap gap-2">
              <Link
                href="/blog"
                aria-current={!active ? "page" : undefined}
                className={chip(!active)}
              >
                {copy.gallery.all}
              </Link>
              {used.map((c) => (
                <Link
                  key={c._id}
                  href={`/blog/category/${c.slug}`}
                  aria-current={c._id === active ? "page" : undefined}
                  className={chip(c._id === active)}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
              {copy.blog.empty}
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-10 md:grid-cols-3">
              {posts.map((p, i) => (
                <li key={p._id} className={i === 0 && posts.length > 3 ? "md:col-span-2" : ""}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
