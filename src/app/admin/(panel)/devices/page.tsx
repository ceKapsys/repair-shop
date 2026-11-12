import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/editor-shell";
import { buttonVariants } from "@/components/ui/button";
import { connectDb } from "@/lib/db";
import { plain } from "@/lib/serialize";
import type { BrandT, DeviceT } from "@/lib/types";
import { Brand, Device } from "@/models";
import { DeviceTree } from "./device-tree";

export const metadata: Metadata = { title: "Devices" };

export default async function Page() {
  await connectDb();
  const [brands, devices] = await Promise.all([
    Brand.find().sort({ order: 1, name: 1 }).lean(),
    Device.find().select("brandId model slug isActive repairs releaseYear").sort({ releaseYear: -1, model: 1 }).lean(),
  ]);
  return (
    <>
      <PageHeader
        title="Devices"
        description="Brands and their models. Open a model to set which repairs it supports and their prices."
        actions={<Link href="/admin/devices/brand/new" className={buttonVariants()}>New brand</Link>}
      />
      <div className="px-4 py-6 md:px-8">
        <DeviceTree brands={plain<BrandT[]>(brands)} devices={plain<DeviceT[]>(devices)} />
      </div>
    </>
  );
}
