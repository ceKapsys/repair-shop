import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { copy, fill } from "@/content/copy";
import { priceText } from "@/lib/format";
import { ServiceIcon } from "./service-icon";

/** Price chip: mist surface, ink text, Geist Mono. */
export function PriceChip({ price, className = "" }: { price: string | null; className?: string }) {
  return <span className={`num inline-flex items-center rounded-full bg-mist px-3 py-1 whitespace-nowrap text-ink ${className}`}>{priceText(price)}</span>;
}

/** One line in a price list: name, duration, warranty and the price chip. */
export function ServiceRow({ href, title, icon, duration, warrantyDays, price }: { href: string; title: string; icon?: string; duration?: string; warrantyDays?: number; price: string | null }) {
  const facts = [duration, warrantyDays ? `${copy.service.facts.warranty.toLowerCase()} ${fill(copy.service.facts.warrantyValue, { warrantyDays })}` : null].filter(Boolean);
  return (
    <Link href={href} className="group flex min-h-16 items-center gap-4 px-4 py-3 hover:bg-surface md:px-5">
      <ServiceIcon name={icon} size={24} className="shrink-0 text-steel" />
      <span className="min-w-0 flex-1">
        <span className="block font-medium group-hover:text-primary-strong">{title}</span>
        {facts.length > 0 && <span className="block text-sm leading-5 text-ink-soft">{facts.join(" · ")}</span>}
      </span>
      <PriceChip price={price} />
      <ChevronRight size={20} strokeWidth={1.75} className="hidden shrink-0 text-steel sm:block" aria-hidden />
    </Link>
  );
}

export function ServiceList({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">{children}</div>;
}
