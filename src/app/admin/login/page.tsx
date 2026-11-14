import type { Metadata } from "next";
import { Suspense } from "react";
import { getSettings } from "@/lib/settings";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const s = await getSettings();
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-card border border-line bg-bg p-8 shadow-card">
        <p className=" text-lg font-semibold">{s.shopName}</p>
        <h1 className="mt-1 text-sm text-ink-soft">Sign in to the admin panel</h1>
        <div className="mt-6">
          <Suspense>
            <LoginForm isDev={process.env.NODE_ENV !== "production"} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
