import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import type { ServiceT } from "@/lib/types";
import { ServiceIcon } from "./service-icon";
import { priceLabel } from "@/lib/format";

interface PriceListRowsProps {
  services: ServiceT[];
  currency?: string;
}

export function PriceListRows({ services, currency = "USD" }: PriceListRowsProps) {
  const active = services.filter((s) => s.isActive);
  const common = active.filter((s) => s.isCommonRepair);
  const displayServices = common.length > 0 ? common : active.slice(0, 6);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {displayServices.map((service) => {
          const price = priceLabel(service, currency);
          return (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-line bg-bg p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-md"
            >
              <div>
                {/* Top Row: Icon + Price Pill */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
                    <ServiceIcon name={service.icon} size={22} />
                  </div>
                  <div className="flex items-center gap-2">
                    {service.isEmergencyAvailable && (
                      <span
                        title="Available for emergency dispatch"
                        className="inline-flex items-center gap-1 rounded-full border border-emergency/20 bg-emergency/10 px-2.5 py-1 text-[11px] font-semibold text-emergency"
                      >
                        <span className="size-1.5 rounded-full bg-emergency" />
                        24/7
                      </span>
                    )}
                    <span className="inline-flex h-8 items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 font-mono text-xs font-bold text-primary">
                      {price ?? "Free Quote"}
                    </span>
                  </div>
                </div>

                {/* Title & Short Description */}
                <h3 className="mt-5 font-heading text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-primary">
                  {service.title}
                </h3>
                {service.shortDesc && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {service.shortDesc}
                  </p>
                )}
              </div>

              {/* Card Footer: Duration, Warranty & Arrow */}
              <div className="mt-6 flex items-center justify-between border-t border-line/70 pt-4 text-xs text-ink-soft">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} className="shrink-0 text-steel" />
                    <span>{service.duration || "30–45 min"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck size={14} className="shrink-0 text-success" />
                    <span>
                      {service.warrantyDays ? `${service.warrantyDays}-day warranty` : "Standard warranty"}
                    </span>
                  </span>
                </div>
                <ArrowRight
                  size={15}
                  className="shrink-0 text-steel transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-bg/80 px-5 py-4 text-sm text-ink-soft">
        <ShieldCheck size={18} className="shrink-0 text-success" />
        <p className="leading-relaxed">
          The final price is confirmed before any work starts. No advance payment required — inspect and pay
          only when your device is fully fixed and tested.
        </p>
      </div>
    </div>
  );
}

