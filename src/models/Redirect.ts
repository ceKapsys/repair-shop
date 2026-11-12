import { Schema } from "mongoose";
import { defineModel } from "./_shared";

const schema = new Schema(
  {
    from: { type: String, required: true, unique: true },
    to: { type: String, required: true },
    code: { type: Number, enum: [301, 302], default: 301 },
  },
  { timestamps: true },
);

export const Redirect = defineModel("Redirect", schema);
