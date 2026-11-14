import type { Metadata } from "next";
import { BlogIndex } from "@/components/site/blog-index";
import { copy, fill } from "@/content/copy";
import { getPostCategories, getPosts } from "@/lib/data";
import { notFoundOrRedirect } from "@/lib/not-found";
import { buildMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getPostCategories()).find((c) => c.slug === slug);
  if (!cat) return {};
  return buildMetadata(cat.seo, { title: fill(copy.blog.category, { category: cat.name }), description: copy.blog.intro, path: `/blog/category/${cat.slug}` });
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getPostCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return notFoundOrRedirect(`/blog/category/${slug}`);
  const posts = await getPosts(cat._id);
  return (
    <BlogIndex
      posts={posts}
      categories={categories}
      active={cat._id}
      title={fill(copy.blog.category, { category: cat.name })}
      crumbs={[{ label: copy.nav.blog, href: "/blog" }, { label: cat.name, href: `/blog/category/${cat.slug}` }]}
    />
  );
}
