import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Devices we repair" };

export default function Page() {
  return <PageStub title="Devices we repair" week="week 3" intro="Phones, laptops, tablets, consoles, smartwatches and audio devices." />;
}
