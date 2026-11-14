import Link from "next/link";
import { Clock, ShieldCheck, Siren } from "lucide-react";
import type { ServiceT } from "@/lib/types";
import { ServiceIcon } from "./service-icon";

/** Card for a service in listings. `price` is pre-computed so device pages can pass the model's own price. */
export function ServiceCard({ service, price, href, duration }: { service: ServiceT; price: string | null; href?: string; duration?: string }) {
  const time = duration || service.duration;
  return (
    <Link
      href={href ?? `/services/${service.slug}`}
      className="pressable group flex h-full flex-col rounded-card border border-line bg-bg p-5 shadow-card hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ServiceIcon name={service.icon} size={22} />
        </span>
        {service.isEmergencyAvailable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emergency/10 px-2 py-0.5 text-xs font-medium text-emergency">
            <Siren size={12} aria-hidden /> Emergency
          </span>
        )}
      </div>
      <h3 className="mt-4 font-semibold group-hover:text-primary">{service.title}</h3>
      {service.shortDesc && <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{service.shortDesc}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-sm">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{price ?? "Get a quote"}</span>
        {time && <span className="flex items-center gap-1 text-ink-soft"><Clock size={14} aria-hidden /> {time}</span>}
        {service.warrantyDays ? <span className="flex items-center gap-1 text-ink-soft"><ShieldCheck size={14} aria-hidden /> {service.warrantyDays}-day warranty</span> : null}
      </div>
    </Link>
  );
}
