import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { editorContext, loadForEdit } from "@/lib/admin-data";
import type { CategoryT } from "@/lib/types";
import { PostCategory, ServiceCategory } from "@/models";
import { CategoryEditor } from "./category-editor";

export const metadata: Metadata = { title: "Edit category" };

export default async function Page({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  if (kind !== "serviceCategory" && kind !== "postCategory") notFound();
  const doc = await loadForEdit<CategoryT>(kind === "serviceCategory" ? ServiceCategory : PostCategory, id);
  return <CategoryEditor kind={kind} doc={doc} {...await editorContext()} />;
}
