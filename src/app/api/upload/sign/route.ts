import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { cloudinaryConfigured, signUpload } from "@/lib/cloudinary";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const ADMIN_FOLDERS = ["services", "devices", "brands", "blog", "gallery", "branding", "pages", "reviews"];

/** Signed-upload parameters. Admin folders need a session; "bookings" (customer photos) is rate-limited. */
export async function POST(req: Request) {
  if (!cloudinaryConfigured()) return NextResponse.json({ error: "Uploads are not configured" }, { status: 501 });
  const { folder } = (await req.json().catch(() => ({}))) as { folder?: string };
  if (folder === "bookings") {
    if (!(await rateLimit("upload", await clientIp(), 10, 3600)).ok)
      return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  } else {
    if (!(await auth())?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!folder || !ADMIN_FOLDERS.includes(folder)) return NextResponse.json({ error: "Bad folder" }, { status: 400 });
  }
  return NextResponse.json(signUpload(`911-repair/${folder}`));
}
