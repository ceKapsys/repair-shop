import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { connectDb, isDbConfigured } from "@/lib/db";
import { Booking } from "@/models";

export const dynamic = "force-dynamic";

/** Privacy: cancelled bookings are deleted 12 months after they were last changed. Runs weekly (see vercel.json). */
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ ok: false, error: "No database" }, { status: 503 });
  await connectDb();
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 12);
  const res = await Booking.deleteMany({ status: "cancelled", updatedAt: { $lt: cutoff } });
  return NextResponse.json({ ok: true, deleted: res.deletedCount });
}
