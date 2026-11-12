import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { seoSchema } from "./_shared";

const repairSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    price: Number,
    showPrice: { type: Boolean, default: true },
    duration: String,
  },
  { _id: false },
);

const schema = new Schema(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true },
    model: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    image: String,
    releaseYear: Number,
    specs: { type: Map, of: String },
    repairs: [repairSchema],
    isActive: { type: Boolean, default: true },
    seo: seoSchema,
  },
  { timestamps: true },
);
schema.index({ brandId: 1, slug: 1 }, { unique: true });
schema.index({ model: "text" });

export type DeviceDoc = InferSchemaType<typeof schema>;
export const Device: Model<DeviceDoc> = models.Device ?? model("Device", schema);
