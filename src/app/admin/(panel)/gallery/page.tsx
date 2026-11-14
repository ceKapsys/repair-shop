import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/editor-shell";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { connectDb } from "@/lib/db";
import { plain } from "@/lib/serialize";
import type { GalleryItemT } from "@/lib/types";
import { GalleryItem } from "@/models";
import { GalleryManager } from "./gallery-manager";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryAdminPage() {
  await connectDb();
  const items = plain<GalleryItemT[]>(await GalleryItem.find().sort({ order: 1, createdAt: -1 }).lean());
  return (
    <>
      <PageHeader title="Gallery" description="Upload photos of your own repairs. Every photo needs alt text. Drag to reorder." />
      <div className="px-4 py-6 md:px-8">
        <GalleryManager items={items} uploadsConfigured={cloudinaryConfigured()} />
      </div>
    </>
  );
}
