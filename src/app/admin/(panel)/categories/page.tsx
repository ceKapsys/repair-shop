import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/editor-shell";
import { buttonVariants } from "@/components/ui/button";
import { connectDb } from "@/lib/db";
import { plain } from "@/lib/serialize";
import type { CategoryT } from "@/lib/types";
import { Post, PostCategory, Service, ServiceCategory } from "@/models";
import { CategoryList } from "./category-list";

export const metadata: Metadata = { title: "Categories" };

export default async function Page() {
  await connectDb();
  const [sc, pc, sCounts, pCounts] = await Promise.all([
    ServiceCategory.find().sort({ order: 1 }).lean(),
    PostCategory.find().sort({ name: 1 }).lean(),
    Service.aggregate([{ $group: { _id: "$categoryId", n: { $sum: 1 } } }]),
    Post.aggregate([{ $unwind: "$categoryIds" }, { $group: { _id: "$categoryIds", n: { $sum: 1 } } }]),
  ]);
  const count = (rows: { _id: unknown; n: number }[]) => Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
  return (
    <>
      <PageHeader title="Categories" />
      <div className="grid gap-8 px-4 py-6 md:px-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Service categories</h2>
            <Link href="/admin/categories/serviceCategory/new" className={buttonVariants({ variant: "outline", size: "sm" })}>Add</Link>
          </div>
          <CategoryList kind="serviceCategory" items={plain<CategoryT[]>(sc)} counts={count(sCounts)} sortable />
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Blog categories</h2>
            <Link href="/admin/categories/postCategory/new" className={buttonVariants({ variant: "outline", size: "sm" })}>Add</Link>
          </div>
          <CategoryList kind="postCategory" items={plain<CategoryT[]>(pc)} counts={count(pCounts)} />
        </section>
      </div>
    </>
  );
}
