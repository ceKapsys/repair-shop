import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deviceOptions, loadForEdit } from "@/lib/admin-data";
import { plain } from "@/lib/serialize";
import type { GalleryItemT, ServiceT } from "@/lib/types";
import { GalleryItem, Service } from "@/models";
import { GalleryEditor } from "./gallery-editor";

export const metadata: Metadata = { title: "Edit photo" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await loadForEdit<GalleryItemT>(GalleryItem, id);
  if (!item) notFound();
  const [others, services, devices] = await Promise.all([
    GalleryItem.find({ _id: { $ne: item._id } }).select("caption alt image").sort({ order: 1 }).lean(),
    Service.find().select("title").sort({ order: 1 }).lean(),
    deviceOptions(),
  ]);
  return (
    <GalleryEditor
      item={item}
      others={plain<GalleryItemT[]>(others).map((o) => ({ value: o._id, label: o.caption || o.alt }))}
      services={plain<ServiceT[]>(services).map((s) => ({ value: s._id, label: s.title }))}
      devices={devices.map((d) => ({ value: d.value, label: `${d.group} ${d.label}` }))}
    />
  );
}
