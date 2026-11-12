import type { Metadata } from "next";
import { AdminStub } from "@/components/admin/admin-stub";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <AdminStub title="Users" week="week 2" items={["Owner and Editor roles", "Invite, reset password, enable 2FA"]} />;
}
