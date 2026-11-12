import { Schema } from "mongoose";
import { defineModel, seoSchema } from "./_shared";

const schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: String,
    order: { type: Number, default: 0 },
    seo: seoSchema,
  },
  { timestamps: true, collection: "serviceCategories" },
);

export const ServiceCategory = defineModel("ServiceCategory", schema);
