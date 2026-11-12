import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <AdminShell
      role={session.user.role}
      userName={session.user.name ?? session.user.email ?? "Admin"}
      signOutSlot={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button className="text-sm text-muted underline-offset-4 hover:underline">Sign out</button>
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
