import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { auth, signOut } from "@/auth";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <>
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
            <button className="min-h-11 text-sm text-muted underline-offset-4 hover:underline">Sign out</button>
          </form>
        }
      >
        {children}
      </AdminShell>
      <Toaster position="bottom-center" richColors closeButton toastOptions={{ className: "mb-16 md:mb-0" }} />
    </>
  );
}
