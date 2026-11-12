import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { faqSchema, imageSchema, PRICE_TYPES, seoSchema } from "./_shared";

const serviceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "ServiceCategory" },
    shortDesc: String,
    body: { json: Schema.Types.Mixed, html: String }, // Tiptap JSON + rendered HTML
    icon: String,
    images: [imageSchema],
    priceType: { type: String, enum: PRICE_TYPES, default: "from" },
    priceMin: Number,
    priceMax: Number,
    showPrice: { type: Boolean, default: true },
    duration: String,
    warrantyDays: { type: Number, default: 90 },
    partsNote: String,
    isEmergencyAvailable: { type: Boolean, default: false },
    deviceIds: [{ type: Schema.Types.ObjectId, ref: "Device" }],
    faqs: [faqSchema],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: seoSchema,
  },
  { timestamps: true },
);
serviceSchema.index({ categoryId: 1, order: 1 });

export type ServiceDoc = InferSchemaType<typeof serviceSchema>;
export const Service: Model<ServiceDoc> = models.Service ?? model("Service", serviceSchema);
