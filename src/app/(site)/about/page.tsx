import type { Metadata } from "next";
import { TextPage } from "@/components/site/text-page";
import { copy, fill } from "@/content/copy";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("about", { title: fill(copy.about.title, { shop: s.shopName }), path: "/about", description: fill(copy.meta.aboutDesc, { shop: s.shopName, city: s.contacts.city }) });
}

export default async function Page() {
  const s = await getSettings();
  return <TextPage pageKey="about" title={fill(copy.about.title, { shop: s.shopName })} path="/about" />;
}
