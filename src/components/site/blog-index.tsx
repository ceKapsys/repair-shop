import Link from "next/link";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { PostCard } from "@/components/site/post-card";
import { copy } from "@/content/copy";
import type { CategoryT, PostT } from "@/lib/types";

/** Blog listing, shared by /blog and /blog/category/[slug]. The first post is shown larger. */
export function BlogIndex({ posts, categories, active, title, intro, crumbs }: { posts: PostT[]; categories: CategoryT[]; active?: string; title: string; intro?: string; crumbs: { label: string; href: string }[] }) {
  const chip = (on: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${on ? "border-mist bg-mist text-ink" : "border-line hover:bg-surface"}`;
  const used = categories.filter((c) => c._id === active || posts.some((p) => p.categoryIds.includes(c._id)) || !active);
  return (
    <>
      <PageHero title={title} intro={intro} crumbs={<Breadcrumbs items={crumbs} />} />
      <div className="container-page pb-16 md:pb-24">
        {used.length > 0 && (
          <nav aria-label={copy.static.postedIn} className="mb-10 flex flex-wrap gap-2">
            <Link href="/blog" aria-current={!active ? "page" : undefined} className={chip(!active)}>{copy.gallery.all}</Link>
            {used.map((c) => (
              <Link key={c._id} href={`/blog/category/${c.slug}`} aria-current={c._id === active ? "page" : undefined} className={chip(c._id === active)}>{c.name}</Link>
            ))}
          </nav>
        )}
        {posts.length === 0 ? (
          <p className="text-ink-soft">{copy.blog.empty}</p>
        ) : (
          <ul className="grid gap-x-6 gap-y-12 md:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p._id} className={i === 0 && posts.length > 3 ? "md:col-span-2" : ""}><PostCard post={p} /></li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
