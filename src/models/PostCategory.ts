import { Schema } from "mongoose";
import { defineModel, seoSchema } from "./_shared";

const schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    seo: seoSchema,
  },
  { timestamps: true, collection: "postCategories" },
);

export const PostCategory = defineModel("PostCategory", schema);
