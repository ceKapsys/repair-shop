import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/auth";
import { PageHeader } from "@/components/admin/editor-shell";
import { adminNav } from "@/components/admin/nav";

export const metadata: Metadata = { title: "More" };

/** The rest of the admin sections, for the "More" tab on phones. */
export default async function MorePage() {
  const user = await currentUser();
  const items = adminNav.filter((i) => !("mobile" in i && i.mobile) && (!("ownerOnly" in i && i.ownerOnly) || user?.role === "owner"));
  return (
    <>
      <PageHeader title="More" />
      <ul className="mx-4 my-6 divide-y divide-line overflow-hidden rounded-card border border-line bg-bg md:mx-8">
        {[...items, { href: "/admin/account", label: "Account", icon: null }].map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex min-h-14 items-center gap-3 px-4 font-medium hover:bg-surface">
              {Icon && <Icon size={20} strokeWidth={1.5} aria-hidden className="text-ink-soft" />} {label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
