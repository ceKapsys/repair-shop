import type { Metadata } from "next";
import { PageStub } from "@/components/ui/page-stub";

export const metadata: Metadata = { title: "About us" };

export default function Page() {
  return <PageStub title="About us" week="week 5" intro="" />;
}
