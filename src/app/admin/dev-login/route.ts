import { NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role") === "editor" ? "editor" : "owner";
  const callbackUrl = url.searchParams.get("callbackUrl") || "/admin";
  const email =
    role === "owner"
      ? (process.env.SEED_ADMIN_EMAIL || process.env.OWNER_EMAIL) || "admin@911repair.com"
      : "tech@911repair.com";

  return await signIn("credentials", {
    email,
    password: "__DEV_ONE_CLICK_LOGIN__",
    redirectTo: callbackUrl,
  });
}

