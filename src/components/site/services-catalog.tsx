"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, ShieldCheck, Sparkles, X, Zap } from "lucide-react";
import type { CategoryT, ServiceT } from "@/lib/types";
import { priceLabel } from "@/lib/format";
import { ServiceIcon } from "./service-icon";

interface ServicesCatalogProps {
  services: ServiceT[];
  categories: CategoryT[];
  currency: string;
  emptyFallback: string;
}

type FilterMode = "all" | "common" | "emergency" | `cat:${string}`;

function ServiceCardItem({ service, currency }: { service: ServiceT; currency: string }) {
  const price = priceLabel(service, currency);

  return (
    <Link
      href={`/services/${service.slug}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-line bg-bg p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-105 group-hover:border-primary group-hover:bg-primary group-hover:text-on-primary">
            <ServiceIcon name={service.icon} size={22} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {service.isEmergencyAvailable && (
              <span
                title="Available for 24/7 emergency dispatch"
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

        <h3 className="mt-5 font-heading text-lg font-bold tracking-tight text-ink transition-colors group-hover:text-primary">
          {service.title}
        </h3>
        {service.shortDesc && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {service.shortDesc}
          </p>
        )}
      </div>

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
        <span className="inline-flex items-center gap-1 font-semibold text-primary opacity-80 transition-all group-hover:opacity-100">
          <span className="hidden sm:inline">Details</span>
          <ArrowRight
            size={15}
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}

export function ServicesCatalog({
  services,
  categories,
  currency,
  emptyFallback,
}: ServicesCatalogProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);

  const activeCategories = useMemo(() => {
    const usedIds = new Set(activeServices.map((s) => s.categoryId).filter(Boolean));
    return categories.filter((c) => usedIds.has(c._id));
  }, [activeServices, categories]);

  const emergencyCount = useMemo(
    () => activeServices.filter((s) => s.isEmergencyAvailable).length,
    [activeServices]
  );

  const commonCount = useMemo(
    () => activeServices.filter((s) => s.isCommonRepair).length,
    [activeServices]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return activeServices.filter((s) => {
      if (filter === "common" && !s.isCommonRepair) return false;
      if (filter === "emergency" && !s.isEmergencyAvailable) return false;
      if (filter.startsWith("cat:") && s.categoryId !== filter.slice(4)) return false;

      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        (s.shortDesc?.toLowerCase().includes(q) ?? false) ||
        (s.duration?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [activeServices, filter, query]);

  if (activeServices.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
        {emptyFallback}
      </div>
    );
  }

  const hasFilters = query.trim().length > 0 || filter !== "all";

  return (
    <div className="space-y-8">
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-2xs sm:p-5">
        {/* Top Row: Spacious Search + Quick Mode Toggles */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-0 flex-1 md:max-w-lg">
            <Search
              size={17}
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-steel"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repairs (e.g. screen, battery, water damage)..."
              aria-label="Search repair services"
              className="h-11 w-full rounded-xl border border-line bg-bg pr-10 pl-10 text-sm text-ink placeholder:text-ink-soft/70 transition-colors focus:border-primary focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-steel hover:bg-surface hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:shrink-0">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                filter === "all"
                  ? "border-primary bg-primary text-on-primary shadow-2xs"
                  : "border-line bg-bg text-ink-soft hover:border-line-strong hover:text-ink"
              }`}
            >
              <span>All services</span>
              <span className="opacity-75">({activeServices.length})</span>
            </button>

            {commonCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter(filter === "common" ? "all" : "common")}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                  filter === "common"
                    ? "border-primary bg-primary text-on-primary shadow-2xs"
                    : "border-line bg-bg text-ink-soft hover:border-line-strong hover:text-ink"
                }`}
              >
                <Sparkles size={13} />
                <span>Common repairs</span>
                <span className="opacity-75">({commonCount})</span>
              </button>
            )}

            {emergencyCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter(filter === "emergency" ? "all" : "emergency")}
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition-colors ${
                  filter === "emergency"
                    ? "border-emergency bg-emergency text-on-primary shadow-2xs"
                    : "border-emergency/25 bg-emergency/10 text-emergency hover:bg-emergency/15"
                }`}
              >
                <Zap size={13} />
                <span>24/7 Emergency</span>
                <span className="opacity-80">({emergencyCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Category Pills */}
        {activeCategories.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line/70 pt-3.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-steel">
              Category:
            </span>
            {activeCategories.map((cat) => {
              const mode: FilterMode = `cat:${cat._id}`;
              const active = filter === mode;
              const count = activeServices.filter((s) => s.categoryId === cat._id).length;
              return (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setFilter(active ? "all" : mode)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/10 font-semibold text-primary"
                      : "border-line bg-bg text-ink-soft hover:border-line-strong hover:text-ink"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] opacity-65">{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
        <p>
          Showing <span className="font-semibold text-ink">{filtered.length}</span> of{" "}
          <span className="font-semibold text-ink">{activeServices.length}</span> repair services
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-strong"
          >
            <X size={14} />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Service Cards Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center">
          <p className="font-heading text-lg font-semibold text-ink">
            No matching repair services found
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
            Try clearing your search or filters — or book a diagnostic and our technician will inspect your device on-site.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="inline-flex h-10 items-center rounded-xl border border-line bg-bg px-4 text-sm font-semibold text-ink hover:border-line-strong"
            >
              Show all services
            </button>
            <Link
              href="/book"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary-strong"
            >
              <span>Book a diagnostic</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <ServiceCardItem key={service._id} service={service} currency={currency} />
          ))}
        </div>
      )}
    </div>
  );
}

