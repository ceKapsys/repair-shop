import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Customer reviews" };

export default function Page() {
  return <PageStub title="Customer reviews" week="week 6" intro="What customers say about us on Google." />;
}
