import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/auth";
import { PageHeader } from "@/components/admin/editor-shell";
import { connectDb } from "@/lib/db";
import { User } from "@/models";
import { AccountPanels } from "./account-panels";

export const metadata: Metadata = { title: "Account" };

export default async function Page() {
  const me = await currentUser();
  if (!me) redirect("/admin/login");
  await connectDb();
  const u = await User.findById(me.id).select("+twoFactorSecret").lean<{ twoFactorSecret?: string }>();
  return (
    <>
      <PageHeader title="Your account" description={`${me.name} · ${me.email}`} />
      <div className="max-w-2xl px-4 py-6 md:px-8">
        <AccountPanels has2fa={Boolean(u?.twoFactorSecret)} />
      </div>
    </>
  );
}
