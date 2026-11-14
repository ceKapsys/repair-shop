import { Schema } from "mongoose";
import { defineModel, seoSchema } from "./_shared";

const repairSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    priceType: { type: String, enum: ["fixed", "from", "hidden"] },
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

export const Device = defineModel("Device", schema);
