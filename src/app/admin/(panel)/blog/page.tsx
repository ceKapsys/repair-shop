import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/editor-shell";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/field";
import { connectDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { plain } from "@/lib/serialize";
import type { PostT } from "@/lib/types";
import { Post } from "@/models";

export const metadata: Metadata = { title: "Blog" };

function state(p: PostT): { label: string; tone: "neutral" | "success" | "warning" } {
  if (p.status === "draft") return { label: "Draft", tone: "neutral" };
  if (p.publishAt && new Date(p.publishAt) > new Date()) return { label: `Scheduled ${formatDate(p.publishAt, { dateStyle: "medium", timeStyle: "short" })}`, tone: "warning" };
  return { label: "Published", tone: "success" };
}

export default async function BlogAdminPage() {
  await connectDb();
  const posts = plain<PostT[]>(await Post.find().select("-body").sort({ updatedAt: -1 }).lean());
  return (
    <>
      <PageHeader title="Blog" description="Drafts are private. Scheduled posts go live on their own at the set time." actions={<Link href="/admin/blog/new" className={buttonVariants()}>New post</Link>} />
      <div className="px-4 py-6 md:px-8">
        {posts.length === 0 ? (
          <p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">No posts yet. Write your first one.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
            {posts.map((p) => {
              const st = state(p);
              return (
                <li key={p._id} className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2">
                  <Link href={`/admin/blog/${p._id}`} className="min-w-0 flex-1 font-medium hover:text-primary">
                    {p.title}
                    <span className="block text-sm font-normal text-ink-soft">/blog/{p.slug}{p.updatedAt ? ` · edited ${formatDate(p.updatedAt)}` : ""}</span>
                  </Link>
                  <Badge tone={st.tone}>{st.label}</Badge>
                  <DeleteButton kind="post" id={p._id} label={p.title} compact />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
