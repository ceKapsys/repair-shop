import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema(
  {
    image: { url: { type: String, required: true }, width: Number, height: Number, blurDataURL: String },
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

export type GalleryItemDoc = InferSchemaType<typeof schema>;
export const GalleryItem: Model<GalleryItemDoc> =
  models.GalleryItem ?? model("GalleryItem", schema);
