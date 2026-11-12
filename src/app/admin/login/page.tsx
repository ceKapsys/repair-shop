import type { Metadata } from "next";
import { siteDefaults } from "@/lib/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-background p-8 shadow-2">
        <p className="font-heading text-lg font-extrabold">{siteDefaults.name}</p>
        <h1 className="mt-1 text-sm text-muted">Sign in to the admin panel</h1>
        <div className="mt-6"><LoginForm /></div>
      </div>
    </main>
  );
}
