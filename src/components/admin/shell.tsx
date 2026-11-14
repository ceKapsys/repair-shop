"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { adminNav } from "./nav";

export function AdminShell({
  children,
  role,
  userName,
  signOutSlot,
}: {
  children: React.ReactNode;
  role: "owner" | "editor";
  userName: string;
  signOutSlot: React.ReactNode;
}) {
  const path = usePathname();
  const items = adminNav.filter((i) => !("ownerOnly" in i && i.ownerOnly) || role === "owner");
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));

  return (
    <div className="md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-bg md:flex">
        <p className="px-5 py-5 font-semibold">Admin</p>
        <nav aria-label="Admin" className="flex-1 space-y-0.5 px-3">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-ink-soft hover:bg-surface hover:text-ink",
                active(href) && "bg-surface font-medium text-ink",
              )}
            >
              <Icon size={18} strokeWidth={1.5} aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line p-4 text-sm">
          <Link href="/admin/account" className="block truncate font-medium hover:text-primary">{userName}</Link>
          <p className="text-xs text-ink-soft capitalize">{role} · <Link href="/admin/account" className="underline-offset-4 hover:underline">Account</Link></p>
          <div className="mt-3">{signOutSlot}</div>
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">{children}</div>

      {/* Bottom tab bar on mobile so the owner can work from a phone on site */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-bg md:hidden"
      >
        {items.filter((i) => "mobile" in i && i.mobile).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs text-ink-soft", active(href) && "text-primary")}
          >
            <Icon size={22} strokeWidth={1.5} aria-hidden /> {label}
          </Link>
        ))}
        <Link href="/admin/more" aria-current={path === "/admin/more" ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs text-ink-soft", path === "/admin/more" && "text-primary")}>
          <Menu size={22} strokeWidth={1.5} aria-hidden /> More
        </Link>
      </nav>
    </div>
  );
}
