import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "SEO" };

export default function Page() {
  return <AdminStub title="SEO" week="week 7" items={["Global title template and default OG image", "Redirects manager", "SEO health table"]} />;
}
