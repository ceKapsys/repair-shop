"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck, Siren } from "lucide-react";
import type { CategoryT, ServiceT } from "@/lib/types";
import { ServiceIcon } from "./service-icon";
import { priceLabel } from "@/lib/format";

interface ServicesShowcaseProps {
  services: ServiceT[];
  categories: CategoryT[];
  currency: string;
}

export function ServicesShowcase({
  services,
  categories,
  currency,
}: ServicesShowcaseProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");

  const filteredServices = useMemo(() => {
    if (activeCategorySlug === "all") return services.slice(0, 8);
    const cat = categories.find((c) => c.slug === activeCategorySlug);
    if (!cat) return services.slice(0, 8);
    return services.filter((s) => String(s.categoryId) === String(cat._id));
  }, [services, categories, activeCategorySlug]);

  return (
    <div>
      {/* Category Pills Header */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategorySlug("all")}
          className={`h-10 rounded-full px-5 text-sm font-semibold transition-all ${
            activeCategorySlug === "all"
              ? "bg-primary text-on-primary "
              : "border border-line bg-surface text-ink-soft hover:border-line/80 hover:text-ink"
          }`}
        >
          All Top Repairs ({services.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            type="button"
            onClick={() => setActiveCategorySlug(cat.slug)}
            className={`h-10 rounded-full px-5 text-sm font-semibold transition-all ${
              activeCategorySlug === cat.slug
                ? "bg-primary text-on-primary "
                : "border border-line bg-surface text-ink-soft hover:border-line/80 hover:text-ink"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredServices.map((service) => {
          const price = priceLabel(service, currency);
          return (
            <div
              key={service._id}
              className="group relative flex flex-col justify-between rounded-2xl border border-line/80 bg-bg p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
                    <ServiceIcon name={service.icon} size={24} />
                  </div>
                  {service.isEmergencyAvailable && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emergency/10 px-2.5 py-1 text-xs font-semibold text-emergency">
                      <Siren size={13} aria-hidden /> 24/7 Emergency
                    </span>
                  )}
                </div>

                <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink group-hover:text-primary">
                  {service.title}
                </h3>

                {service.shortDesc && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {service.shortDesc}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-line/60">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="rounded-lg bg-surface px-2.5 py-1 text-sm font-semibold text-ink border border-line/60">
                    {price}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    {service.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={13} /> {service.duration}
                      </span>
                    )}
                    {service.warrantyDays && (
                      <span className="flex items-center gap-1">
                        <ShieldCheck size={13} /> {service.warrantyDays}d warranty
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/book?service=${service.slug}`}
                    className="pressable flex-1 rounded-xl bg-primary px-3 py-2.5 text-center text-xs font-semibold text-on-primary transition-opacity hover:opacity-95"
                  >
                    Book This Fix
                  </Link>
                  <Link
                    href={`/services/${service.slug}`}
                    className="pressable flex size-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:text-ink"
                    title="View service details"
                  >
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink transition-all hover:bg-bg hover:border-primary/50"
        >
          <span>View All Repair Services & Full Price Catalog</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}

