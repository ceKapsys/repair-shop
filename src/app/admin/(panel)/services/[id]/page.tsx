import type { Metadata } from "next";
import { connectDb } from "@/lib/db";
import { deviceOptions, editorContext, loadForEdit } from "@/lib/admin-data";
import { plain } from "@/lib/serialize";
import type { CategoryT, ServiceT } from "@/lib/types";
import { Service, ServiceCategory } from "@/models";
import { ServiceEditor } from "./service-editor";

export const metadata: Metadata = { title: "Edit service" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = await loadForEdit<ServiceT>(Service, id);
  await connectDb();
  const [categories, devices, ctx] = await Promise.all([ServiceCategory.find().sort({ order: 1 }).lean(), deviceOptions(), editorContext()]);
  return <ServiceEditor service={service} categories={plain<CategoryT[]>(categories)} devices={devices} {...ctx} />;
}
