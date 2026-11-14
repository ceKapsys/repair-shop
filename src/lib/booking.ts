import "server-only";
import { createElement } from "react";
import { after } from "next/server";
import { AdminAlertEmail, type BookingEmailData } from "@/emails/admin-alert";
import { CustomerConfirmationEmail } from "@/emails/customer-confirmation";
import { Booking, nextBookingNo } from "@/models";
import { emergencyStatus, isSlotAvailable } from "./availability";
import type { BookingCatalog } from "./booking-types";
import { getAllDevices, getBrands, getServices } from "./data";
import { connectDb } from "./db";
import { sendEmail } from "./email";
import { estimateLabel, formatMoney } from "./format";
import { reportError } from "./report";
import { copy, fill } from "@/content/copy";
import { waLink } from "./links";
import type { SiteSettings } from "./settings";
import { siteDefaults } from "./site";
import { formatLocalDate, formatWindow } from "./time";
import type { BookingInput } from "./validation/booking";

export async function bookingCatalog(): Promise<BookingCatalog> {
  const [services, brands, devices] = await Promise.all([getServices(), getBrands(), getAllDevices()]);
  return {
    services: services.map((s) => ({
      id: s._id, slug: s.slug, title: s.title, icon: s.icon, shortDesc: s.shortDesc, priceType: s.priceType, priceMin: s.priceMin, priceMax: s.priceMax,
      showPrice: s.showPrice, duration: s.duration, isEmergencyAvailable: s.isEmergencyAvailable, deviceIds: s.deviceIds,
    })),
    brands: brands.map((b) => ({ id: b._id, name: b.name, deviceType: b.deviceType, logo: b.logo })),
    devices: devices.map((d) => ({ id: d._id, brandId: d.brandId, model: d.model, image: d.image, repairs: d.repairs })),
  };
}

/** Only accept customer photos that were uploaded to our own Cloudinary account. */
function ownPhotos(urls: string[]) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud) return [];
  return urls.filter((u) => u.startsWith(`https://res.cloudinary.com/${cloud}/`));
}

export type CreateResult = { ok: true; bookingNo: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Validate a parsed booking against live data (areas, catalogue, slot capacity, emergency hours),
 * store it with a readable number, and queue the alert and confirmation emails after the response.
 */
export async function createBooking(input: BookingInput, s: SiteSettings, source?: string): Promise<CreateResult> {
  const area = s.serviceAreas.find((a) => a.slug === input.address.area || a.name === input.address.area);
  if (!area) return { ok: false, error: fill(copy.booking.when.outside, { phone: s.contacts.phones[0] }), fieldErrors: { "address.area": copy.errors.pickArea } };

  const catalog = await bookingCatalog();
  const device = input.device.deviceId ? catalog.devices.find((d) => d.id === input.device.deviceId) : undefined;
  if (input.device.deviceId && !device) return { ok: false, error: copy.errors.stale, fieldErrors: { device: copy.errors.pickDevice } };
  const brand = device && catalog.brands.find((b) => b.id === device.brandId);
  const deviceLabel = device ? `${brand?.name ?? ""} ${device.model}`.trim() : input.device.customDevice?.trim() || "Not specified";

  const services = input.serviceIds.map((id) => catalog.services.find((x) => x.id === id));
  if (services.some((x) => !x)) return { ok: false, error: copy.errors.stale, fieldErrors: { serviceIds: copy.errors.pickProblem } };
  const picked = services as NonNullable<(typeof services)[number]>[];
  const baseEstimate = estimateLabel(picked.map((x) => ({ service: x, repair: device?.repairs.find((r) => r.serviceId === x.id) })), s.currency) ?? undefined;

  let slotLabel: string;
  let responseMinutes: number | undefined;
  let feeLabel: string | undefined;
  if (input.type === "standard") {
    if (!(await isSlotAvailable(s, input.preferredSlot.date, input.preferredSlot.window)))
      return { ok: false, error: copy.errors.slotTaken, fieldErrors: { "preferredSlot.window": copy.errors.slotTaken } };
    slotLabel = `${formatLocalDate(input.preferredSlot.date)}, ${formatWindow(input.preferredSlot.window)}`;
  } else {
    const st = emergencyStatus(s);
    if (!st.open) return { ok: false, error: copy.errors.emergencyClosed };
    responseMinutes = st.responseMinutes;
    slotLabel = `Emergency: call within ${st.responseMinutes} min`;
    if (st.fee > 0) feeLabel = formatMoney(st.fee, s.currency);
  }

  const estimate = [baseEstimate ?? copy.service.priceHidden, feeLabel ? `+ ${feeLabel} emergency fee` : null].filter(Boolean).join(" ");

  await connectDb();
  const bookingNo = await nextBookingNo();
  const photos = ownPhotos(input.photos ?? []);
  const doc = await Booking.create({
    bookingNo,
    type: input.type,
    customer: { name: input.customer.name, phone: input.customer.phone, whatsapp: input.customer.whatsapp, email: input.customer.email || undefined },
    address: { line: input.address.line, area: area.name, city: input.address.city || s.contacts.city, mapLink: input.address.mapLink || undefined, lat: input.address.lat, lng: input.address.lng },
    deviceId: device?.id,
    deviceLabel,
    customDevice: device ? undefined : input.device.customDevice,
    serviceIds: picked.map((x) => x.id),
    serviceLabels: picked.map((x) => x.title),
    estimate,
    issueNote: input.issueNote,
    photos,
    preferredSlot: input.type === "standard" ? input.preferredSlot : undefined,
    status: "new",
    statusHistory: [{ status: "new", by: "customer" }],
    source,
  });

  const data: BookingEmailData = {
    shopName: s.shopName,
    bookingNo,
    type: input.type,
    customer: { name: input.customer.name, phone: input.customer.phone, whatsapp: input.customer.whatsapp, email: input.customer.email || undefined },
    address: { line: input.address.line, area: area.name, city: input.address.city || s.contacts.city, mapLink: input.address.mapLink || undefined },
    device: deviceLabel,
    services: picked.map((x) => x.title),
    issueNote: input.issueNote,
    slot: slotLabel,
    estimate,
    photos,
    adminUrl: `${siteDefaults.url}/admin/bookings/${doc._id}`,
  };
  const customerEmail = input.customer.email || undefined;
  const serviceText = picked.map((x) => x.title).join(", ") || copy.booking.problem.somethingElse;
  const addressText = [input.address.line, area.name].filter(Boolean).join(", ");
  const subjectVars = { bookingNo, device: deviceLabel, service: serviceText, responseMinutes };
  const adminSubject =
    input.type === "emergency"
      ? fill(copy.email.emergencySubject, subjectVars)
      : fill(copy.email.adminSubject, { ...subjectVars, date: formatLocalDate(input.preferredSlot.date), window: formatWindow(input.preferredSlot.window) });
  const customerBody =
    input.type === "emergency"
      ? fill(copy.email.customerEmergencyBody, { name: input.customer.name, device: deviceLabel, service: serviceText, address: addressText, phone: input.customer.phone, responseMinutes, shop: s.shopName })
      : fill(copy.email.customerBody, {
          name: input.customer.name, address: addressText, date: formatLocalDate(input.preferredSlot.date), window: formatWindow(input.preferredSlot.window),
          device: deviceLabel, service: serviceText, phone: input.customer.phone, shop: s.shopName,
        });

  // Emails go out after the response. A failure never loses the booking: it is recorded on the
  // booking (shown as a warning on the admin dashboard) and reported.
  after(async () => {
    const admin = s.alertEmails.length
      ? await sendEmail({ to: s.alertEmails, subject: adminSubject, react: createElement(AdminAlertEmail, data), replyTo: customerEmail })
      : { ok: false as const, error: "No alert email addresses are set in Settings" };
    const customer =
      customerEmail && s.notifications.customerConfirmation
        ? await sendEmail({
            to: customerEmail,
            subject: fill(copy.email.customerSubject, { shop: s.shopName, bookingNo }),
            react: createElement(CustomerConfirmationEmail, { ...data, body: customerBody, whatsappUrl: waLink(s.contacts.whatsapp, fill(copy.whatsapp.booking, { shop: s.shopName, bookingNo })) }),
            replyTo: s.contacts.email,
          })
        : null;
    const failed = [!admin.ok && `admin alert: ${admin.error}`, customer && !customer.ok && `customer confirmation: ${customer.error}`].filter(Boolean) as string[];
    try {
      await Booking.updateOne({ _id: doc._id }, { $set: { emailStatus: { admin: admin.ok ? "sent" : "failed", customer: customer ? (customer.ok ? "sent" : "failed") : "skipped", error: failed.join("; ") || undefined, at: new Date() } } });
    } catch (err) {
      await reportError(err, { where: "booking email status", bookingNo });
    }
    if (failed.length) await reportError(new Error(`Booking email failed: ${failed.join("; ")}`), { bookingNo });
  });

  return { ok: true, bookingNo };
}
