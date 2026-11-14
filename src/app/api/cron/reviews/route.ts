import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/cron";
import { isDbConfigured } from "@/lib/db";
import { syncReviews } from "@/lib/google-reviews";
import { TAGS } from "@/lib/tags";

export const dynamic = "force-dynamic";

/** Daily review sync (see vercel.json). */
export async function GET(request: Request) {
  if (!cronAuthorized(request)) return new NextResponse("Unauthorized", { status: 401 });
  if (!isDbConfigured()) return NextResponse.json({ ok: false, error: "No database" }, { status: 503 });
  const result = await syncReviews();
  if (result.ok) {
    revalidateTag(TAGS.reviews);
    revalidateTag(TAGS.settings);
  }
  // "Nothing connected yet" is not a failure of the job.
  return NextResponse.json(result);
}
