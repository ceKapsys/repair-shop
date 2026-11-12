import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Blog" };

export default function Page() {
  return <PageStub title="Blog" week="week 6" intro="Repair tips and guides." />;
}
