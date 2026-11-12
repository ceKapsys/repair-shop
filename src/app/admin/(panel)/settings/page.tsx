import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <AdminStub title="Settings" week="week 2" items={["Logo, favicon, brand colour, hero text", "Phones, WhatsApp, email, address, map", "Hours, service areas, booking windows and capacity", "Emergency fee, hours and response time per weekday", "Alert email list"]} />;
}
