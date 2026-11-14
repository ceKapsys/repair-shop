import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/editor-shell";
import { requireOwnerPage } from "@/lib/admin-data";
import { connectDb } from "@/lib/db";
import type { UserT } from "@/lib/types";
import { User } from "@/models";
import { UserManager } from "./user-manager";

export const metadata: Metadata = { title: "Users" };

export default async function Page() {
  const me = await requireOwnerPage();
  await connectDb();
  const rows = await User.find().select("name email role lastLoginAt lockedUntil +twoFactorSecret").sort({ role: -1, name: 1 }).lean();
  const users: (UserT & { locked: boolean })[] = rows.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    has2fa: Boolean(u.twoFactorSecret),
    lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : undefined,
    locked: Boolean(u.lockedUntil && new Date(u.lockedUntil) > new Date()),
  }));
  return (
    <>
      <PageHeader title="Users" description="Owners can change settings and manage users. Editors manage content and bookings." />
      <div className="px-4 py-6 md:px-8">
        <UserManager users={users} meId={me.id} />
      </div>
    </>
  );
}
