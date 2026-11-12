import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Blog" };

export default function Page() {
  return <AdminStub title="Blog" week="week 6" items={["Tiptap editor with internal-link picker", "Draft / schedule / publish", "SEO tab with snippet preview"]} />;
}
