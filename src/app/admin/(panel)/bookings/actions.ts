"use server";

import { createElement } from "react";
import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { requireRole } from "@/auth";
import { StatusUpdateEmail } from "@/emails/status-update";
import { errorMessage, fail, zodErrors, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { loadSettings } from "@/lib/settings";
import { bookingAdminInput } from "@/lib/validation/admin";
import { Booking } from "@/models";

/** Change status / quoted price / add a note on a booking, optionally emailing the customer about the new status. */
export async function updateBooking(id: string, input: unknown): Promise<ActionResult> {
  try {
    const { user } = await requireRole();
    if (!isValidObjectId(id)) return fail("Booking not found");
    const parsed = bookingAdminInput.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields", zodErrors(parsed.error));
    const { status, quotedPrice, note, notifyCustomer } = parsed.data;
    await connectDb();
    const doc = await Booking.findById(id);
    if (!doc) return fail("Booking not found");

    const statusChanged = Boolean(status && status !== doc.status);
    if (statusChanged) {
      doc.status = status;
      doc.statusHistory.push({ status, at: new Date(), by: user.name });
    }
    // Only touch the quote when the caller sent the field, so a quick status change never clears it.
    if (input && typeof input === "object" && "quotedPrice" in input && quotedPrice !== doc.quotedPrice) doc.quotedPrice = quotedPrice;
    if (note) doc.adminNotes.push({ text: note, at: new Date(), by: user.name });
    await doc.save();

    let emailed = false;
    if (statusChanged && notifyCustomer && doc.customer?.email) {
      const s = await loadSettings();
      if (s.notifications.statusUpdates) {
        emailed = true;
        const to = doc.customer.email as string;
        const data = { shopName: s.shopName, name: doc.customer.name as string, bookingNo: doc.bookingNo as string, status: status!, phone: s.contacts.phones[0] };
        after(() => sendEmail({ to, subject: `Booking ${data.bookingNo} update — ${s.shopName}`, react: createElement(StatusUpdateEmail, data), replyTo: s.contacts.email }));
      }
    }
    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    return { ok: true, message: emailed ? "Saved and customer emailed" : "Saved" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

/** Quick status change from the list (no note, no email). */
export async function setBookingStatus(id: string, status: string): Promise<ActionResult> {
  return updateBooking(id, { status, notifyCustomer: false });
}
