import Link from "next/link";
import { copy, fill } from "@/content/copy";
import { formatDate } from "@/lib/format";
import type { PostT } from "@/lib/types";
import { PLACEHOLDER_FRAME, Photo } from "./photo";

export function PostCard({ post }: { post: PostT }) {
  return (
    <article className="group relative flex h-full flex-col">
      <Photo
        src={post.coverImage?.url || PLACEHOLDER_FRAME}
        alt={post.coverImage?.alt ?? ""}
        width={post.coverImage?.width ?? 1200}
        height={post.coverImage?.height ?? 900}
        sizes="(min-width: 768px) 380px, 100vw"
        className="aspect-[3/2] w-full rounded-card border border-line object-cover"
      />
      <p className="mt-4 text-sm leading-5 text-ink-soft">
        {post.publishAt ? <time dateTime={post.publishAt}>{formatDate(post.publishAt)}</time> : null}
        {post.publishAt && post.readingTime ? " · " : null}
        {post.readingTime ? fill(copy.blog.minutes, { minutes: post.readingTime }) : null}
      </p>
      <h3 className="mt-1">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-primary-strong">{post.title}</Link>
      </h3>
      {post.excerpt && <p className="mt-2 line-clamp-3 text-[15px] leading-6 text-ink-soft">{post.excerpt}</p>}
    </article>
  );
}
