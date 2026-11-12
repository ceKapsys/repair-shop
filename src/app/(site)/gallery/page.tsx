import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Our work" };

export default function Page() {
  return <PageStub title="Our work" week="week 6" intro="Before and after photos from real repairs." />;
}
