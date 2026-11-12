import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <AdminStub title="Dashboard" week="week 4" items={["Today’s and upcoming bookings", "Emergency queue pinned on top", "Counts by status and last 7 days", "New Google reviews", "Pages missing SEO"]} />;
}
