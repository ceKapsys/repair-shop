import type { Metadata } from "next";
import { BlogIndex } from "@/components/site/blog-index";
import { copy } from "@/content/copy";
import { getPostCategories, getPosts } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata("blog", { title: copy.blog.title, path: "/blog", description: copy.blog.intro });
}

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getPostCategories()]);
  return <BlogIndex posts={posts} categories={categories} title={copy.blog.title} intro={copy.blog.intro} crumbs={[{ label: copy.nav.blog, href: "/blog" }]} />;
}
