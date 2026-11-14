import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/settings";

interface AreasServedProps {
  serviceAreas: SiteSettings["serviceAreas"];
  phone?: string;
}

export function AreasServed({ serviceAreas, phone = "(954) 955-7572" }: AreasServedProps) {
  // Identify the center hub (e.g. Margate)
  const centerHub = serviceAreas.find(
    (a) => a.name.toLowerCase().includes("center hub") || a.slug === "margate"
  );
  const otherAreas = serviceAreas.filter((a) => a !== centerHub);

  return (
    <section className="py-20 md:py-24" id="areas" aria-labelledby="areas-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-[24px] border border-line bg-surface p-8 md:p-12 shadow-card">
          {/* Header */}
          <div className="max-w-2xl">
            <h2
              id="areas-h"
              className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl"
            >
              Areas We Serve
            </h2>
            <div className="mt-2.5 h-1 w-12 rounded-full bg-primary" />
            <p className="mt-4 text-base text-ink-soft sm:text-lg">
              We provide fast phone and device repair services in the following locations:
            </p>
          </div>

          {/* Locations Pills Grid */}
          <div className="mt-8 flex flex-wrap gap-2.5 sm:gap-3">
            {/* Center Hub Featured Pill */}
            {centerHub && (
              <Link
                href={`/book?area=${centerHub.slug}`}
                className="group inline-flex items-center gap-2 rounded-full border-2 border-primary bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-on-primary shadow-xs"
              >
                <MapPin size={16} className="shrink-0" />
                <span>{centerHub.name}</span>
              </Link>
            )}

            {/* Other Location Pills */}
            {otherAreas.map((area) => (
              <Link
                key={area.slug}
                href={`/book?area=${area.slug}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-background px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-mist"
              >
                <span>{area.name}</span>
              </Link>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line/60 pt-6">
            <p className="text-sm italic text-ink-soft">
              Don&apos;t see your area? Contact us to verify coverage!
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <span>Contact coverage team</span>
                <ArrowRight size={15} />
              </Link>

              <a
                href={`tel:${phone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-ink hover:bg-mist"
              >
                <Phone size={13} />
                <span>Call {phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
