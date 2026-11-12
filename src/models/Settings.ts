import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const daySchedule = new Schema(
  {
    day: { type: Number, min: 0, max: 6 }, // 0 = Sunday
    enabled: Boolean,
    open: String, // "09:00"
    close: String,
    responseMinutes: Number,
  },
  { _id: false },
);

/** Single document (_id: "site"). */
const schema = new Schema(
  {
    _id: { type: String, default: "site" },
    shopName: String,
    hero: { title: String, subtitle: String },
    branding: { logo: String, logoDark: String, favicon: String, primaryColor: String },
    contacts: {
      phones: [String],
      whatsapp: String,
      whatsappMessage: String,
      email: String,
      address: String,
      mapEmbed: String,
    },
    hours: [{ day: Number, open: String, close: String, closed: Boolean, _id: false }],
    serviceAreas: [{ name: String, slug: String, note: String, _id: false }],
    bookingSlots: {
      windows: [String], // e.g. "09:00-12:00"
      leadTimeHours: { type: Number, default: 2 },
      maxPerSlot: { type: Number, default: 3 },
    },
    emergency: { enabled: Boolean, fee: Number, schedule: [daySchedule] },
    alertEmails: [String],
    googleBusiness: {
      accountId: String,
      locationId: String,
      placeId: String,
      tokensEncrypted: String,
      lastSyncAt: Date,
    },
    seoDefaults: { titleTemplate: String, description: String, ogImage: String },
    analytics: { ga4Id: String, searchConsoleVerification: String },
    socials: { type: Map, of: String },
  },
  { timestamps: true, collection: "settings" },
);

export type SettingsDoc = InferSchemaType<typeof schema>;
export const Settings: Model<SettingsDoc> = models.Settings ?? model("Settings", schema);
