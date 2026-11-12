import { Schema } from "mongoose";
import { defineModel } from "./_shared";

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

/** Single document (_id: "site"). Public fields are read through getSettings(). */
const schema = new Schema(
  {
    _id: { type: String, default: "site" },
    shopName: String,
    tagline: String,
    timezone: String,
    currency: String,
    hero: { title: String, subtitle: String, image: String },
    branding: { logo: String, logoDark: String, favicon: String, primaryColor: String },
    contacts: {
      phones: [String],
      whatsapp: String,
      whatsappMessage: String,
      email: String,
      address: String,
      city: String,
      mapEmbed: String,
    },
    hours: [{ day: Number, open: String, close: String, closed: Boolean, _id: false }],
    serviceAreas: [{ name: String, slug: String, note: String, _id: false }],
    bookingSlots: {
      windows: [String], // "09:00-12:00"
      leadTimeHours: Number,
      maxPerSlot: Number,
      daysAhead: Number,
      closedDays: [Number],
    },
    emergency: { enabled: Boolean, fee: Number, schedule: [daySchedule] },
    alertEmails: [String],
    notifications: { customerConfirmation: Boolean, statusUpdates: Boolean },
    googleBusiness: {
      accountName: String, // "accounts/123"
      locationName: String, // "locations/456"
      locationTitle: String,
      tokensEncrypted: String,
      connectedAt: Date,
      placeId: String,
      mapsUri: String,
      rating: Number,
      ratingCount: Number,
      lastSyncAt: Date,
      lastSyncError: String,
    },
    seoDefaults: { titleTemplate: String, description: String, ogImage: String },
    analytics: { ga4Id: String, searchConsoleVerification: String },
    socials: { facebook: String, instagram: String, tiktok: String, youtube: String, x: String },
    faqs: [{ question: String, answer: String, _id: false }],
  },
  { timestamps: true, collection: "settings" },
);

export const Settings = defineModel("Settings", schema);
