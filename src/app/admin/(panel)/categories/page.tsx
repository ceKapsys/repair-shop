import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Categories" };

export default function Page() {
  return <AdminStub title="Categories" week="week 3" items={["Service categories and post categories", "Order, icon, SEO"]} />;
}
