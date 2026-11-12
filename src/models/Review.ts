import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema(
  {
    source: { type: String, enum: ["google", "manual"], default: "google" },
    externalId: { type: String, unique: true, sparse: true },
    authorName: { type: String, required: true },
    authorPhoto: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    text: String,
    publishedAt: Date,
    isVisible: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type ReviewDoc = InferSchemaType<typeof schema>;
export const Review: Model<ReviewDoc> = models.Review ?? model("Review", schema);
