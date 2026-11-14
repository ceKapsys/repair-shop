import type { Metadata } from "next";
import { TextPage } from "@/components/site/text-page";
import { copy, fill } from "@/content/copy";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("terms", { title: fill(copy.legal.terms, { shop: s.shopName }), path: "/terms" });
}

export default async function Page() {
  const s = await getSettings();
  return <TextPage pageKey="terms" title={fill(copy.legal.terms, { shop: s.shopName })} path="/terms" showUpdated />;
}
