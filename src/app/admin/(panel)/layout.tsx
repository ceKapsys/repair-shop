import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { currentUser, signOut } from "@/auth";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user) redirect("/admin/login");

  return (
    <>
      <AdminShell
        role={user.role}
        userName={user.name || user.email}
        signOutSlot={
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="min-h-11 text-sm text-ink-soft underline-offset-4 hover:underline">Sign out</button>
          </form>
        }
      >
        {children}
      </AdminShell>
      <Toaster position="bottom-center" richColors closeButton toastOptions={{ className: "mb-16 md:mb-0" }} />
    </>
  );
}
