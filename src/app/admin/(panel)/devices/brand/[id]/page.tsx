import type { Metadata } from "next";
import { editorContext, loadForEdit } from "@/lib/admin-data";
import type { BrandT } from "@/lib/types";
import { Brand } from "@/models";
import { BrandEditor } from "./brand-editor";

export const metadata: Metadata = { title: "Edit brand" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BrandEditor brand={await loadForEdit<BrandT>(Brand, id)} {...await editorContext()} />;
}
