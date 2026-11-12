import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Bookings" };

export default function Page() {
  return <AdminStub title="Bookings" week="week 4" items={["Filter by status, type, date, area", "Detail drawer with status history and notes", "Quoted price, one-tap call/WhatsApp", "CSV export"]} />;
}
