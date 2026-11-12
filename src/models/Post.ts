import { Schema } from "mongoose";
import { defineModel, imageSchema, seoSchema } from "./_shared";

const schema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: String,
    body: { json: Schema.Types.Mixed, html: String },
    coverImage: imageSchema,
    categoryIds: [{ type: Schema.Types.ObjectId, ref: "PostCategory" }],
    tags: [String],
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["draft", "scheduled", "published"], default: "draft" },
    publishAt: Date,
    readingTime: Number,
    seo: seoSchema,
  },
  { timestamps: true },
);
schema.index({ status: 1, publishAt: -1 });

export const Post = defineModel("Post", schema);
