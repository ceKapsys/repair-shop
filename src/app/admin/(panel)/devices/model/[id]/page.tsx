import type { Metadata } from "next";
import { connectDb } from "@/lib/db";
import { editorContext, loadForEdit } from "@/lib/admin-data";
import { plain } from "@/lib/serialize";
import type { BrandT, DeviceT, ServiceT } from "@/lib/types";
import { Brand, Device, Service } from "@/models";
import { DeviceEditor } from "./device-editor";

export const metadata: Metadata = { title: "Edit device" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ brand?: string }> }) {
  const { id } = await params;
  const { brand } = await searchParams;
  const device = await loadForEdit<DeviceT>(Device, id);
  await connectDb();
  const [brands, services, ctx] = await Promise.all([
    Brand.find().sort({ order: 1, name: 1 }).lean(),
    Service.find().select("title priceType priceMin priceMax showPrice duration").sort({ order: 1 }).lean(),
    editorContext(),
  ]);
  return <DeviceEditor device={device} defaultBrand={brand} brands={plain<BrandT[]>(brands)} services={plain<ServiceT[]>(services)} {...ctx} />;
}
