import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Gallery" };

export default function Page() {
  return <AdminStub title="Gallery" week="week 6" items={["Drag-and-drop upload, required alt text", "Before/after pairing", "Drag-to-reorder"]} />;
}
