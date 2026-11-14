"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { buttonVariants } from "@/components/ui/button";
import { copy } from "@/content/copy";

/** Mobile navigation sheet: a native <dialog>, so focus trapping and Escape come for free. */
export function MobileMenu({ links }: { links: { href: string; label: string; emergency?: boolean }[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const path = usePathname();
  useEffect(() => ref.current?.close(), [path]);
  return (
    <>
      <button type="button" aria-label={copy.nav.menu} onClick={() => ref.current?.showModal()} className="flex size-11 items-center justify-center rounded-input text-ink md:hidden">
        <Menu size={24} strokeWidth={1.75} aria-hidden />
      </button>
      <dialog
        ref={ref}
        aria-label={copy.nav.menu}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="drawer-slide fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[min(20rem,calc(100%-3rem))] max-w-none bg-bg p-0 text-ink"
      >
        <div className="flex h-full flex-col p-4">
          <button type="button" aria-label={copy.nav.closeMenu} onClick={() => ref.current?.close()} className="ml-auto flex size-11 items-center justify-center rounded-input">
            <X size={24} strokeWidth={1.75} aria-hidden />
          </button>
          <nav aria-label={copy.nav.menu} className="mt-2 flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`flex min-h-12 items-center gap-2 border-b border-line text-lg font-medium ${l.emergency ? "text-emergency" : ""}`}>
                {l.emergency && <span className="size-2 rounded-full bg-emergency" aria-hidden />}
                {l.label}
              </Link>
            ))}
          </nav>
          <Link href="/book" className={buttonVariants({ size: "lg", className: "mt-6" })}>
            {copy.nav.book}
          </Link>
        </div>
      </dialog>
    </>
  );
}
