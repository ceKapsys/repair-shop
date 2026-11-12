import Link from "next/link";
import { Siren } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const nav = [
  { href: "/services", label: "Services" },
  { href: "/devices", label: "Devices" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader({ shopName }: { shopName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="font-heading text-lg font-extrabold tracking-tight">
          {shopName}
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 text-[15px] text-muted hover:text-foreground">
              {n.label}
            </Link>
          ))}
          <Link href="/emergency" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[15px] font-medium text-emergency">
            <Siren size={18} strokeWidth={1.5} aria-hidden /> Emergency
          </Link>
        </nav>
        <Link href="/book" className={buttonVariants({ className: "ml-auto md:ml-2" })}>
          Book a repair
        </Link>
      </div>
    </header>
  );
}
