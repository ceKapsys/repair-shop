import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";
import type { ServiceT } from "@/lib/types";
import { ServiceIcon } from "./service-icon";
import { priceLabel } from "@/lib/format";

interface PriceListRowsProps {
  services: ServiceT[];
  currency?: string;
}

export function PriceListRows({ services, currency = "USD" }: PriceListRowsProps) {
  const activeServices = services.filter((s) => s.isActive).slice(0, 6);

  return (
    <div className="border-t border-line-strong">
      <div className="divide-y divide-line">
        {activeServices.map((service) => {
          const price = priceLabel(service, currency);
          return (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="pressable price-row-grid group -mx-2.5 rounded-xl px-2.5 py-4 transition-colors hover:bg-surface"
            >
              {/* Icon */}
              <div className="flex size-11 items-center justify-center rounded-xl bg-surface text-steel transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <ServiceIcon name={service.icon} size={22} />
              </div>

              {/* Title and Short Description */}
              <div className="min-w-0">
                <div className="font-heading text-lg font-semibold text-ink group-hover:text-primary">
                  {service.title}
                </div>
                {service.shortDesc && (
                  <p className="line-clamp-1 text-sm text-ink-soft mt-0.5">
                    {service.shortDesc}
                  </p>
                )}
              </div>

              {/* Duration Fact */}
              <div className="hidden items-center gap-2 text-sm text-ink-soft md:flex">
                <Clock size={16} className="text-steel shrink-0" />
                <span>{service.duration || "30–45 min"}</span>
              </div>

              {/* Warranty Fact */}
              <div className="hidden items-center gap-2 text-sm text-ink-soft md:flex">
                <ShieldCheck size={16} className="text-steel shrink-0" />
                <span>{service.warrantyDays ? `${service.warrantyDays}-day warranty` : "Standard warranty"}</span>
              </div>

              {/* Price Chip */}
              <div className="justify-self-end">
                <span className="inline-flex h-9 items-center rounded-full bg-mist px-3.5 font-mono text-sm font-semibold text-ink">
                  {price ?? "Free Quote"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink-soft">
        The final price is confirmed before any work starts. No advance payment required — inspect and pay
        only when your device is fully fixed and tested.
      </p>
    </div>
  );
}

