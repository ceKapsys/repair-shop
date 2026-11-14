"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Sparkles } from "lucide-react";
import type { BrandT, DeviceT, ServiceT } from "@/lib/types";

interface QuickEstimateCardProps {
  brands: BrandT[];
  devices: DeviceT[];
  services: ServiceT[];
  currency?: string;
}

export function QuickEstimateCard({
  brands,
  devices,
  services,
  currency = "USD",
}: QuickEstimateCardProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?._id ?? "");
  
  // Devices filtered by brand
  const brandDevices = useMemo(() => {
    return devices.filter((d) => String(d.brandId) === selectedBrandId);
  }, [devices, selectedBrandId]);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(brandDevices[0]?._id ?? "");

  // Update selected device if brand changes and device is no longer in brand
  const activeDevice = useMemo(() => {
    const found = brandDevices.find((d) => d._id === selectedDeviceId);
    return found ?? brandDevices[0] ?? null;
  }, [brandDevices, selectedDeviceId]);

  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(
    services[0]?.slug ?? "screen-replacement"
  );

  const activeService = useMemo(() => {
    return services.find((s) => s.slug === selectedServiceSlug) ?? services[0] ?? null;
  }, [services, selectedServiceSlug]);

  // Compute estimate for selected device + service
  const repairEstimate = useMemo(() => {
    if (!activeDevice || !activeService) return null;
    const match = activeDevice.repairs?.find(
      (r) => String(r.serviceId) === String(activeService._id)
    );
    if (match && typeof match.price === "number") {
      return {
        price: `${currency === "USD" ? "$" : currency}${match.price}`,
        duration: match.duration || activeService.duration || "30 mins",
      };
    }
    if (activeService.priceMin != null) {
      return {
        price: `from ${currency === "USD" ? "$" : currency}${activeService.priceMin}`,
        duration: activeService.duration || "30 mins",
      };
    }
    return {
      price: "Free estimate",
      duration: activeService.duration || "30 mins",
    };
  }, [activeDevice, activeService, currency]);

  const bookUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (activeDevice?._id) params.set("device", activeDevice._id);
    if (activeService?.slug) params.set("service", activeService.slug);
    return `/book?${params.toString()}`;
  }, [activeDevice, activeService]);

  return (
    <div className="relative rounded-2xl border border-line/80 bg-bg p-6 shadow-card md:p-8">
      {/* Decorative top pill */}
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles size={13} className="text-primary" /> Instant Price Checker
        </span>
        <span className="text-xs text-ink-soft">Fixed upfront pricing</span>
      </div>

      <h3 className=" text-xl font-semibold tracking-tight text-ink">
        Calculate Your Repair Cost
      </h3>
      <p className="mt-1 text-sm text-ink-soft">
        Select your device & repair to see instant estimates before booking.
      </p>

      <div className="mt-6 space-y-4">
        {/* Brand selection */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            1. Device Brand
          </label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {brands.slice(0, 5).map((b) => {
              const isSelected = (selectedBrandId || brands[0]?._id) === b._id;
              return (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => {
                    setSelectedBrandId(b._id);
                    const firstForBrand = devices.find((d) => String(d.brandId) === b._id);
                    if (firstForBrand) setSelectedDeviceId(firstForBrand._id);
                  }}
                  className={`flex h-11 items-center justify-center rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary "
                      : "border-line bg-surface text-ink hover:border-line/80 hover:bg-bg"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Model selection */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            2. Exact Model
          </label>
          <select
            value={activeDevice?._id ?? ""}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            {brandDevices.map((d) => (
              <option key={d._id} value={d._id}>
                {d.model} ({d.releaseYear || "Latest"})
              </option>
            ))}
          </select>
        </div>

        {/* Service selection */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
            3. Issue or Problem
          </label>
          <select
            value={selectedServiceSlug}
            onChange={(e) => setSelectedServiceSlug(e.target.value)}
            className="h-11 w-full rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            {services.map((s) => (
              <option key={s._id} value={s.slug}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic estimate output banner */}
      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Estimated Total
            </span>
            <div className="mt-1 text-2xl font-semibold text-ink">
              {repairEstimate?.price ?? "Check online"}
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft">
              <Clock size={13} /> {repairEstimate?.duration ?? "25-45 mins"}
            </span>
            <div className="text-[11px] text-ink-soft">Doorstep arrival included</div>
          </div>
        </div>

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft border-t border-primary/10 pt-3">
          <li className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-primary" /> Genuine OEM-grade
          </li>
          <li className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-primary" /> 90-day warranty
          </li>
          <li className="flex items-center gap-1">
            <CheckCircle2 size={13} className="text-primary" /> Pay on completion
          </li>
        </ul>
      </div>

      {/* Action CTA */}
      <div className="mt-6">
        <Link
          href={bookUrl}
          className="pressable group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-card transition-all hover:opacity-95"
        >
          <span>Book This Repair Now</span>
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Link>
        <p className="mt-2 text-center text-xs text-ink-soft">
          No prepayment required • Reschedule or cancel anytime
        </p>
      </div>
    </div>
  );
}

