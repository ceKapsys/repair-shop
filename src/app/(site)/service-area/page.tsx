import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Service area" };

export default function Page() {
  return <PageStub title="Service area" week="week 5" intro="Where our technicians travel." />;
}
