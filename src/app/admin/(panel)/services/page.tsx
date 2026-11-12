import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <AdminStub title="Services" week="week 3" items={["Drag-to-reorder list", "Rich-text editor, images, price type, Show price toggle", "Duration, warranty, emergency toggle, linked devices, FAQs", "SEO tab and live preview"]} />;
}
