import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { seoSchema } from "./_shared";

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

export type ServiceCategoryDoc = InferSchemaType<typeof schema>;
export const ServiceCategory: Model<ServiceCategoryDoc> =
  models.ServiceCategory ?? model("ServiceCategory", schema);
