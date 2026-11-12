import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Devices" };

export default function Page() {
  return <AdminStub title="Devices" week="week 3" items={["Brands → models tree", "Bulk add models", "Per-model repair price matrix with Show price toggles", "SEO tab"]} />;
}
