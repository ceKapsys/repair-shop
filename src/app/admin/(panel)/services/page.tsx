import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/editor-shell";
import { buttonVariants } from "@/components/ui/button";
import { connectDb } from "@/lib/db";
import { loadSettings } from "@/lib/settings";
import { plain } from "@/lib/serialize";
import type { CategoryT, ServiceT } from "@/lib/types";
import { Service, ServiceCategory } from "@/models";
import { ServiceList } from "./service-list";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage() {
  await connectDb();
  const [services, categories, s] = await Promise.all([
    Service.find().sort({ order: 1 }).lean(),
    ServiceCategory.find().sort({ order: 1 }).lean(),
    loadSettings(),
  ]);
  return (
    <>
      <PageHeader
        title="Services"
        description="Drag to reorder. The order here is the order on the website."
        actions={<Link href="/admin/services/new" className={buttonVariants()}>New service</Link>}
      />
      <div className="px-4 py-6 md:px-8">
        <ServiceList services={plain<ServiceT[]>(services)} categories={plain<CategoryT[]>(categories)} currency={s.currency} />
      </div>
    </>
  );
}
