import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editorContext } from "@/lib/admin-data";
import { connectDb } from "@/lib/db";
import { plain } from "@/lib/serialize";
import type { PageT } from "@/lib/types";
import { Page, PAGE_KEYS, type PageKey } from "@/models";
import { PageEditor } from "./page-editor";

export const metadata: Metadata = { title: "Edit page" };

/** Pages whose body text is shown on the site (the others use the standard wording). */
const WITH_BODY = new Set<string>(["about", "privacy", "terms", "service-area"]);

export default async function PageSeoEditor({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!Object.hasOwn(PAGE_KEYS, key)) notFound();
  const def = PAGE_KEYS[key as PageKey];
  await connectDb();
  const doc = plain<PageT | null>(await Page.findOne({ key }).lean());
  const { siteUrl, titleTemplate } = await editorContext();
  return <PageEditor pageKey={key} path={def.path} name={def.title} doc={doc} withBody={WITH_BODY.has(key)} siteUrl={siteUrl} titleTemplate={titleTemplate} />;
}
