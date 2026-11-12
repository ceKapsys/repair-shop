import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const schema = new Schema(
  {
    from: { type: String, required: true, unique: true },
    to: { type: String, required: true },
    code: { type: Number, enum: [301, 302], default: 301 },
  },
  { timestamps: true },
);

export type RedirectDoc = InferSchemaType<typeof schema>;
export const Redirect: Model<RedirectDoc> = models.Redirect ?? model("Redirect", schema);
