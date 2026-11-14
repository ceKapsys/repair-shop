"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Gamepad2,
  Headphones,
  Laptop,
  Search,
  Smartphone,
  Tablet,
  Watch,
} from "lucide-react";
import type { BrandT, DeviceT } from "@/lib/types";

// Design catalog categories & models (from uploaded HTML design file)
const DEFAULT_CATALOG: Record<
  string,
  {
    icon: typeof Smartphone;
    deviceType: string;
    brands: Record<string, string[]>;
  }
> = {
  Phones: {
    icon: Smartphone,
    deviceType: "phone",
    brands: {
      Apple: [
        "iPhone 15 Pro Max",
        "iPhone 15 Pro",
        "iPhone 15",
        "iPhone 14 Pro",
        "iPhone 14",
        "iPhone 13",
        "iPhone 12",
        "iPhone 11",
        "iPhone SE (2022)",
      ],
      Samsung: [
        "Galaxy S24 Ultra",
        "Galaxy S24",
        "Galaxy S23 Ultra",
        "Galaxy S23",
        "Galaxy S22",
        "Galaxy Z Fold 5",
        "Galaxy Z Flip 5",
        "Galaxy A54 5G",
        "Galaxy A15",
      ],
      "Google Pixel": [
        "Pixel 8 Pro",
        "Pixel 8",
        "Pixel 7 Pro",
        "Pixel 7",
        "Pixel 6a",
      ],
      Motorola: [
        "Motorola Edge (2023)",
        "Razr+ (2023)",
        "Moto G Stylus 5G",
        "Moto G Power",
      ],
      OnePlus: ["OnePlus 12", "OnePlus 11", "OnePlus Open", "Nord N30"],
    },
  },
  "Laptops & PCs": {
    icon: Laptop,
    deviceType: "laptop",
    brands: {
      Apple: [
        'MacBook Pro 16" M3',
        'MacBook Air 13" M2',
        "MacBook Air M1",
        'MacBook Pro 14"',
        'MacBook Pro 13"',
      ],
      HP: ["Spectre x360", "Envy 16", "Pavilion 15", "EliteBook 840"],
      Dell: ["XPS 15", "XPS 13", "Inspiron 15", "Latitude 5420"],
      Lenovo: ["ThinkPad X1 Carbon", "ThinkPad T14", "Legion Pro 5", "Yoga 9i"],
      "Microsoft Surface": ["Surface Laptop 5", "Surface Laptop Studio 2", "Surface Pro 9"],
      Asus: ["ROG Zephyrus G14", "ZenBook 14", "TUF Gaming F15"],
    },
  },
  Tablets: {
    icon: Tablet,
    deviceType: "tablet",
    brands: {
      Apple: ['iPad Pro 12.9" M2', "iPad 10th gen", "iPad Air 5", 'iPad Pro 11"', "iPad mini 6"],
      Samsung: ["Galaxy Tab S9", "Galaxy Tab S8", "Galaxy Tab A9+", "Galaxy Tab S6 Lite"],
      Microsoft: ["Surface Pro 9", "Surface Pro 8", "Surface Go 3"],
      Amazon: ["Fire HD 10", "Fire HD 8", "Fire Max 11"],
    },
  },
  Consoles: {
    icon: Gamepad2,
    deviceType: "console",
    brands: {
      Sony: [
        "PlayStation 5",
        "PlayStation 4 Pro",
        "PlayStation 4",
        "DualSense controller",
      ],
      Microsoft: ["Xbox Series X", "Xbox Series S", "Xbox One"],
      Nintendo: ["Switch OLED", "Switch", "Joy-Con"],
    },
  },
  Watches: {
    icon: Watch,
    deviceType: "smartwatch",
    brands: {
      Apple: ["Apple Watch Ultra 2", "Apple Watch Series 9", "Apple Watch SE"],
      Samsung: ["Galaxy Watch 6 Classic", "Galaxy Watch 6", "Galaxy Watch 5"],
      Google: ["Pixel Watch 2", "Pixel Watch"],
      Garmin: ["Fenix 7", "Forerunner 965", "Venu 3"],
    },
  },
  Audio: {
    icon: Headphones,
    deviceType: "audio",
    brands: {
      Apple: ["AirPods Pro 2", "AirPods 3", "AirPods Max"],
      Bose: ["QuietComfort Ultra", "QuietComfort 45", "QC Ultra Earbuds"],
      Sony: ["WH-1000XM5", "WF-1000XM5", "WH-1000XM4"],
      Beats: ["Studio Pro", "Solo 4", "Studio Buds +"],
    },
  },
};

interface DevicePickerProps {
  dbBrands?: BrandT[];
  dbDevices?: DeviceT[];
}

export function DevicePicker({ dbBrands = [], dbDevices = [] }: DevicePickerProps) {
  const [activeType, setActiveType] = useState<string>("Phones");
  const [activeBrand, setActiveBrand] = useState<string>("Apple");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamically merge DB brands and devices with DEFAULT_CATALOG
  const catalog = useMemo(() => {
    const cat: Record<
      string,
      {
        icon: (typeof DEFAULT_CATALOG)[keyof typeof DEFAULT_CATALOG]["icon"];
        deviceType: string;
        brands: Record<string, string[]>;
      }
    > = {};

    for (const [key, val] of Object.entries(DEFAULT_CATALOG)) {
      cat[key] = {
        icon: val.icon,
        deviceType: val.deviceType,
        brands: { ...val.brands },
      };
    }

    const brandMap = new Map<string, BrandT>();
    for (const b of dbBrands) {
      brandMap.set(b._id, b);
      // Ensure brand is present in category if matching
      const targetCat = Object.values(cat).find((c) => c.deviceType === b.deviceType);
      if (targetCat && !targetCat.brands[b.name]) {
        targetCat.brands[b.name] = [];
      }
    }

    for (const d of dbDevices) {
      if (!d.isActive) continue;
      const b = brandMap.get(d.brandId);
      if (!b) continue;

      const targetCat = Object.values(cat).find((c) => c.deviceType === b.deviceType);
      if (targetCat) {
        if (!targetCat.brands[b.name]) {
          targetCat.brands[b.name] = [];
        }
        if (!targetCat.brands[b.name].includes(d.model)) {
          targetCat.brands[b.name].unshift(d.model);
        }
      }
    }

    return cat;
  }, [dbBrands, dbDevices]);

  const currentCategory = catalog[activeType] ?? catalog["Phones"];
  const brandsList = Object.keys(currentCategory.brands);

  // If activeBrand is not in the current category, fallback to first brand
  const effectiveBrand = brandsList.includes(activeBrand) ? activeBrand : brandsList[0];

  // Model list computation with search filter
  const displayedModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result: { model: string; brand: string; url: string }[] = [];

    if (q) {
      // Search across all brands in current device type
      for (const [brandName, models] of Object.entries(currentCategory.brands)) {
        for (const m of models) {
          const full = `${brandName} ${m}`.toLowerCase();
          if (full.includes(q)) {
            // Check if device exists in DB
            const matchedDbDevice = dbDevices.find(
              (d) => d.model.toLowerCase() === m.toLowerCase()
            );
            const matchedBrand = dbBrands.find(
              (b) => b.name.toLowerCase() === brandName.toLowerCase()
            );

            const url =
              matchedDbDevice && matchedBrand
                ? `/devices/${matchedBrand.slug}/${matchedDbDevice.slug}`
                : `/book?device=${encodeURIComponent(m)}`;

            result.push({ model: m, brand: brandName, url });
          }
        }
      }
    } else {
      // Show models for currently selected brand
      const models = currentCategory.brands[effectiveBrand] ?? [];
      for (const m of models) {
        const matchedDbDevice = dbDevices.find(
          (d) => d.model.toLowerCase() === m.toLowerCase()
        );
        const matchedBrand = dbBrands.find(
          (b) => b.name.toLowerCase() === effectiveBrand.toLowerCase()
        );

        const url =
          matchedDbDevice && matchedBrand
            ? `/devices/${matchedBrand.slug}/${matchedDbDevice.slug}`
            : `/book?device=${encodeURIComponent(m)}`;

        result.push({ model: m, brand: effectiveBrand, url });
      }
    }

    return result;
  }, [searchQuery, currentCategory, effectiveBrand, dbDevices, dbBrands]);

  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-bg shadow-card">
      {/* Category Tabs Header */}
      <div
        className="flex gap-1 overflow-x-auto border-b border-line p-2 scrollbar-none"
        role="tablist"
        aria-label="Device type tabs"
      >
        {Object.entries(catalog).map(([typeName, item]) => {
          const Icon = item.icon;
          const isSelected = activeType === typeName;
          return (
            <button
              key={typeName}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                setActiveType(typeName);
                const newBrands = Object.keys(item.brands);
                setActiveBrand(newBrands[0] || "");
                setSearchQuery("");
              }}
              className={`flex h-11 shrink-0 items-center gap-2 rounded-[var(--r-ctrl)] px-4 text-sm font-medium transition-colors ${
                isSelected
                  ? "bg-mist font-semibold text-ink"
                  : "bg-transparent text-ink-soft hover:bg-surface hover:text-ink"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span>{typeName}</span>
            </button>
          );
        })}
      </div>

      {/* Picker Body (2 columns: Brands Left, Models & Search Right) */}
      <div className="grid min-h-[360px] md:grid-cols-[260px_1fr]">
        {/* Left: Brands List */}
        <div className="flex flex-row gap-1 overflow-x-auto border-b border-line p-3 md:flex-col md:border-b-0 md:border-r md:p-4">
          {brandsList.map((brandName) => {
            const count = currentCategory.brands[brandName]?.length || 0;
            const isSelected = effectiveBrand === brandName;
            return (
              <button
                key={brandName}
                type="button"
                onClick={() => {
                  setActiveBrand(brandName);
                  setSearchQuery("");
                }}
                className={`flex h-11 shrink-0 items-center justify-between rounded-[var(--r-ctrl)] px-3 text-left text-sm font-medium transition-colors md:w-full ${
                  isSelected
                    ? "bg-surface font-semibold text-ink shadow-[inset_2px_0_0_var(--color-primary)]"
                    : "text-ink hover:bg-surface/80"
                }`}
              >
                <span>{brandName}</span>
                <span className="font-mono text-xs text-ink-soft ml-3">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Search & Models List */}
        <div className="p-5 md:p-6">
          <div className="relative">
            <label
              htmlFor="model-search"
              className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2"
            >
              Search your model
            </label>
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                id="model-search"
                type="search"
                placeholder={`Search model, e.g. ${
                  activeType === "Phones"
                    ? "Galaxy S24 or iPhone 15"
                    : activeType === "Laptops & PCs"
                    ? "MacBook Air or ThinkPad"
                    : "Pro, Air, etc."
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
                className="h-12 w-full rounded-[var(--r-ctrl)] border border-line bg-bg pl-10 pr-4 text-sm text-ink placeholder:text-ink-soft/60 focus:border-transparent focus:outline-hidden focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Models Grid */}
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {displayedModels.map((item) => (
              <li key={`${item.brand}-${item.model}`}>
                <Link
                  href={item.url}
                  className="pressable group flex min-h-12 items-center justify-between gap-2 rounded-[var(--r-ctrl)] border border-line bg-bg p-3 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  <span className="truncate">{item.model}</span>
                  <ArrowRight
                    size={15}
                    className="shrink-0 text-steel transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {displayedModels.length === 0 && (
            <div className="mt-4 rounded-[var(--r-ctrl)] border border-dashed border-line-strong p-5 text-sm text-ink-soft">
              We haven&rsquo;t listed repairs for this specific model yet. Contact us directly and we&rsquo;ll
              confirm parts availability and cost on the spot!
            </div>
          )}

          <p className="mt-4 text-sm text-ink-soft">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              <span>My model isn&rsquo;t listed</span>
              <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
