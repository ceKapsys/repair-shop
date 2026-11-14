import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/auth";
import { authUrl, googleOAuthConfigured } from "@/lib/google-reviews";
import { siteDefaults } from "@/lib/site";

/** Start the Google Business Profile OAuth flow (owner only). */
export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== "owner") return NextResponse.redirect(`${siteDefaults.url}/admin/login`);
  if (!googleOAuthConfigured()) return NextResponse.redirect(`${siteDefaults.url}/admin/reviews?google=not-configured`);
  const state = randomBytes(24).toString("hex");
  const res = NextResponse.redirect(authUrl(state));
  res.cookies.set("g_oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/api/google" });
  return res;
}
