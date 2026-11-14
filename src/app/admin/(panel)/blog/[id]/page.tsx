import type { Metadata } from "next";
import { editorContext, loadForEdit } from "@/lib/admin-data";
import { connectDb } from "@/lib/db";
import { plain } from "@/lib/serialize";
import type { CategoryT, PostT } from "@/lib/types";
import { Post, PostCategory } from "@/models";
import { PostEditor } from "./post-editor";

export const metadata: Metadata = { title: "Edit post" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await loadForEdit<PostT>(Post, id);
  await connectDb();
  const categories = plain<CategoryT[]>(await PostCategory.find().sort({ name: 1 }).lean());
  const { siteUrl, titleTemplate } = await editorContext();
  return <PostEditor post={post} categories={categories} siteUrl={siteUrl} titleTemplate={titleTemplate} />;
}
