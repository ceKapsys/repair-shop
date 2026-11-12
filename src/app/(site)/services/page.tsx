import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Repair services" };

export default function Page() {
  return <PageStub title="Repair services" week="week 3" intro="Every repair we offer, with prices, time and warranty." />;
}
