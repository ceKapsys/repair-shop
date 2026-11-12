import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Book a repair" };

export default function Page() {
  return <PageStub title="Book a repair" week="week 4" intro="Four short steps: device, problem, time and address, contact." />;
}
