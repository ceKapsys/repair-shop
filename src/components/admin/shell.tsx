"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-background md:flex">
        <p className="px-5 py-5 font-heading font-extrabold">911 Admin</p>
        <nav aria-label="Admin" className="flex-1 space-y-0.5 px-3">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-surface hover:text-foreground",
                active(href) && "bg-surface font-medium text-foreground",
              )}
            >
              <Icon size={18} strokeWidth={1.5} aria-hidden /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-4 text-sm">
          <p className="truncate font-medium">{userName}</p>
          <p className="text-xs text-muted capitalize">{role}</p>
          <div className="mt-3">{signOutSlot}</div>
        </div>
      </aside>

      <div className="min-w-0 pb-20 md:pb-0">{children}</div>

      {/* Bottom tab bar on mobile so the owner can work from a phone on site */}
      <nav
        aria-label="Admin"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background md:hidden"
      >
        {items.filter((i) => "mobile" in i && i.mobile).map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={active(href) ? "page" : undefined}
            className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs text-muted", active(href) && "text-primary")}
          >
            <Icon size={22} strokeWidth={1.5} aria-hidden /> {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
