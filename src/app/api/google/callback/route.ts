import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/auth";
import { connectWithCode } from "@/lib/google-reviews";
import { reportError } from "@/lib/report";
import { siteDefaults } from "@/lib/site";

/** Google redirects here after consent. The state cookie ties the response to the owner who started it. */
export async function GET(request: NextRequest) {
  const back = (status: string) => {
    const res = NextResponse.redirect(`${siteDefaults.url}/admin/reviews?google=${status}`);
    res.cookies.delete({ name: "g_oauth_state", path: "/api/google" });
    return res;
  };
  const user = await currentUser();
  if (!user || user.role !== "owner") return NextResponse.redirect(`${siteDefaults.url}/admin/login`);
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const expected = request.cookies.get("g_oauth_state")?.value ?? "";
  const a = Buffer.from(state);
  const b = Buffer.from(expected);
  if (!code || !expected || a.length !== b.length || !timingSafeEqual(a, b)) return back("denied");
  try {
    await connectWithCode(code);
    return back("connected");
  } catch (err) {
    await reportError(err, { where: "google callback" });
    return back("failed");
  }
}
