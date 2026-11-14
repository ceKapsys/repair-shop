import type { Metadata } from "next";
import { TextPage } from "@/components/site/text-page";
import { copy, fill } from "@/content/copy";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("privacy", { title: fill(copy.legal.privacy, { shop: s.shopName }), path: "/privacy" });
}

export default async function Page() {
  const s = await getSettings();
  return <TextPage pageKey="privacy" title={fill(copy.legal.privacy, { shop: s.shopName })} path="/privacy" showUpdated />;
}
