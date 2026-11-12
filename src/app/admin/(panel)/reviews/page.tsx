import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return <AdminStub title="Reviews" week="week 6" items={["Connect Google Business Profile", "Sync now, hide or feature reviews", "Manual testimonials"]} />;
}
