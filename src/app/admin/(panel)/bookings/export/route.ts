import { currentUser } from "@/auth";
import { findBookings } from "@/lib/booking-admin";
import { connectDb } from "@/lib/db";

/** Quote a CSV cell, and neutralise spreadsheet formulas (=, +, -, @) from customer-entered text. */
function cell(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(req: Request) {
  if (!(await currentUser())) return new Response("Unauthorized", { status: 401 });
  const p = new URL(req.url).searchParams;
  await connectDb();
  const rows = await findBookings(
    { status: p.get("status") ?? "all", type: p.get("type") ?? undefined, from: p.get("from") ?? undefined, to: p.get("to") ?? undefined, q: p.get("q") ?? undefined, area: p.get("area") ?? undefined },
    10_000,
  );
  const head = ["Booking no", "Created", "Type", "Status", "Name", "Phone", "WhatsApp", "Email", "Area", "Address", "Device", "Repairs", "Visit date", "Window", "Estimate", "Quoted price", "Customer notes", "Map link"];
  const lines = rows.map((b) =>
    [
      b.bookingNo, b.createdAt, b.type, b.status, b.customer.name, b.customer.phone, b.customer.whatsapp ? "yes" : "no", b.customer.email, b.address.area,
      [b.address.line, b.address.city].filter(Boolean).join(", "), b.deviceLabel || b.customDevice, b.serviceLabels?.join("; "), b.preferredSlot?.date, b.preferredSlot?.window,
      b.estimate, b.quotedPrice, b.issueNote, b.address.mapLink,
    ].map(cell).join(","),
  );
  const csv = "﻿" + [head.join(","), ...lines].join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="bookings-${date}.csv"`, "cache-control": "no-store" },
  });
}
