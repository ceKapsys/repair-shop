import { Schema } from "mongoose";
import { defineModel, BOOKING_STATUSES } from "./_shared";

const schema = new Schema(
  {
    bookingNo: { type: String, required: true, unique: true },
    type: { type: String, enum: ["standard", "emergency"], default: "standard" },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      whatsapp: { type: Boolean, default: true },
      email: String,
    },
    address: {
      line: String,
      area: String,
      city: String,
      mapLink: String,
      lat: Number,
      lng: Number,
    },
    deviceId: { type: Schema.Types.ObjectId, ref: "Device" },
    deviceLabel: String, // snapshot for emails and admin
    customDevice: String,
    serviceIds: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    serviceLabels: [String],
    estimate: String,
    issueNote: String,
    photos: [String],
    preferredSlot: { date: String, window: String }, // date: "YYYY-MM-DD" in shop timezone
    status: { type: String, enum: BOOKING_STATUSES, default: "new" },
    statusHistory: [
      { status: String, at: { type: Date, default: Date.now }, by: String, _id: false },
    ],
    quotedPrice: Number,
    adminNotes: [{ text: String, at: { type: Date, default: Date.now }, by: String, _id: false }],
    source: String,
    emailStatus: { admin: String, customer: String, error: String, at: Date }, // "sent" | "failed" | "skipped"
  },
  { timestamps: true },
);
schema.index({ status: 1, createdAt: -1 });
schema.index({ "preferredSlot.date": 1, "preferredSlot.window": 1 });

export const Booking = defineModel("Booking", schema);

/** Atomic per-month counter for readable booking numbers, e.g. RS-2611-0042. */
const counterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } });
const Counter = defineModel("Counter", counterSchema);

export async function nextBookingNo(now = new Date()) {
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const c = await Counter.findOneAndUpdate(
    { _id: `booking-${yymm}` },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return `RS-${yymm}-${String(c.seq).padStart(4, "0")}`;
}
