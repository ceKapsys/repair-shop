import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { DEVICE_TYPES, seoSchema } from "./_shared";

const schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    deviceType: { type: String, enum: DEVICE_TYPES, required: true },
    order: { type: Number, default: 0 },
    seo: seoSchema,
  },
  { timestamps: true },
);

export type BrandDoc = InferSchemaType<typeof schema>;
export const Brand: Model<BrandDoc> = models.Brand ?? model("Brand", schema);
