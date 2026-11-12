import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { seoSchema } from "./_shared";

const schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    seo: seoSchema,
  },
  { timestamps: true, collection: "postCategories" },
);

export type PostCategoryDoc = InferSchemaType<typeof schema>;
export const PostCategory: Model<PostCategoryDoc> =
  models.PostCategory ?? model("PostCategory", schema);
