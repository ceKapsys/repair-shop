import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "Booking received", robots: { index: false } };

export default function Page() {
  return <PageStub title="Booking received" week="week 4" />;
}
