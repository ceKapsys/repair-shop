import { Schema } from "mongoose";
import { defineModel } from "./_shared";

const schema = new Schema(
  {
    image: { url: { type: String, required: true }, width: Number, height: Number, blurDataURL: String },
    afterImage: { url: String, width: Number, height: Number, blurDataURL: String, alt: String },
    caption: String,
    alt: { type: String, required: true },
    tags: [String],
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    isBeforeAfter: { type: Boolean, default: false },
    pairId: { type: Schema.Types.ObjectId, ref: "GalleryItem" },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, collection: "gallery" },
);

export const GalleryItem = defineModel("GalleryItem", schema);
