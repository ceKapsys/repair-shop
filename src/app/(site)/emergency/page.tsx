import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Emergency repair" };

export default function Page() {
  return <PageStub title="Emergency repair" week="week 4" intro="Same-day help when your device can’t wait." />;
}
