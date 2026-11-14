import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { copy } from "@/content/copy";
import type { SiteSettings } from "@/lib/settings";
import { MobileMenu } from "./mobile-menu";

const links = [
  { href: "/services", label: copy.nav.services },
  { href: "/devices", label: copy.nav.devices },
  { href: "/emergency", label: copy.nav.emergency, emergency: true },
  { href: "/blog", label: copy.nav.blog },
  { href: "/contact", label: copy.nav.contact },
];

export function SiteHeader({ s }: { s: SiteSettings }) {
  const { logo, logoDark } = s.branding;
  const phone = s.contacts.phones[0] || "(305) 911-7372";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-sm">
      <div className="container-page flex h-18 items-center gap-4">
        <Link
          href="/"
          className="mr-auto flex min-h-11 items-center gap-2.5 text-base font-bold tracking-tight text-ink md:text-lg"
          aria-label={`${s.shopName}: ${copy.nav.home}`}
        >
          {logo ? (
            <>
              <Image
                src={logo}
                alt={s.shopName}
                width={160}
                height={40}
                priority
                className={`h-9 w-auto ${logoDark ? "dark:hidden" : ""}`}
              />
              {logoDark && (
                <Image
                  src={logoDark}
                  alt={s.shopName}
                  width={160}
                  height={40}
                  priority
                  className="hidden h-9 w-auto dark:block"
                />
              )}
            </>
          ) : (
            <>
              <span className="flex size-[34px] items-center justify-center rounded-[9px] bg-ink font-mono text-[13px] font-semibold text-bg">
                911
              </span>
              <span>{s.shopName}</span>
            </>
          )}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`inline-flex min-h-11 items-center gap-2 rounded-input px-3 text-[15px] font-medium ${
                l.emergency ? "text-emergency" : "text-ink hover:text-primary-strong"
              }`}
            >
              {l.emergency && <span className="size-2 rounded-full bg-emergency" aria-hidden />}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-4 lg:flex">
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="flex items-center gap-2 text-[15px] font-medium text-ink hover:text-primary"
          >
            <Phone size={15} className="text-steel" />
            <span className="font-mono">{phone}</span>
          </a>
        </div>

        <Link
          href="/book"
          className={buttonVariants({ size: "sm", className: "md:ml-2 font-semibold" })}
        >
          {copy.nav.book}
        </Link>
        <MobileMenu links={links} />
      </div>
    </header>
  );
}
