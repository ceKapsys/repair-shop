import Image from "next/image";
import { Check } from "lucide-react";

interface HeroVisualProps {
  ticketNo?: string;
  deviceTitle?: string;
  location?: string;
  imageUrl?: string;
}

export function HeroVisual({
  ticketNo = "RS-2611-0042",
  deviceTitle = "iPhone 15 Pro · Screen replacement",
  location = "4045 NW 16th St, Lauderhill, FL",
  imageUrl = "/images/hero-technician.jpg",
}: HeroVisualProps) {
  return (
    <div className="relative pb-14 pl-0 sm:pl-10">
      {/* Technician photo frame */}
      <div
        className="relative aspect-4/5 w-full overflow-hidden rounded-[18px] border border-line bg-surface shadow-md"
        role="img"
        aria-label="Doorstep Technician · 911 Phone Repair"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Doorstep Technician · 911 Phone Repair"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            priority
            className="object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, var(--color-surface) 0 14px, var(--color-line) 14px 15px)`,
            }}
          />
        )}
      </div>

      {/* Floating live repair ticket (solid background, no image bleed/overwrite) */}
      <article
        className="absolute bottom-0 left-0 z-10 w-[92%] max-w-[340px] rounded-[var(--radius-card)] border border-line bg-bg p-5 shadow-2xl"
        aria-label="Example booking ticket"
      >
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span className="font-mono text-sm font-semibold text-ink">{ticketNo}</span>
          <span className="rounded-full bg-mist/40 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-steel">
            Example
          </span>
        </div>

        <h3 className="mt-2.5 font-heading text-[17px] font-bold leading-snug text-ink">
          {deviceTitle}
        </h3>
        <p className="mt-0.5 text-sm text-ink-soft">{location}</p>

        {/* 4-Step Tracking Timeline */}
        <ol className="mt-4 grid gap-2.5 border-t border-dashed border-line pt-3.5 text-sm">
          {/* Step 1: Done */}
          <li className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 text-ink-soft">
            <span className="flex size-[18px] items-center justify-center rounded-full bg-success text-on-primary">
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="text-xs sm:text-sm">Booked online</span>
            <time className="font-mono text-xs">1:52 PM</time>
          </li>

          {/* Step 2: Done */}
          <li className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 text-ink-soft">
            <span className="flex size-[18px] items-center justify-center rounded-full bg-success text-on-primary">
              <Check size={11} strokeWidth={3} />
            </span>
            <span className="text-xs sm:text-sm">Technician confirmed</span>
            <time className="font-mono text-xs">1:58 PM</time>
          </li>

          {/* Step 3: Active Now */}
          <li className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 font-medium text-ink">
            <span className="flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-primary">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
            </span>
            <span className="text-xs sm:text-sm">On the way, arriving 2:30–3:00</span>
            <time className="font-mono text-xs text-primary font-bold">now</time>
          </li>

          {/* Step 4: Pending */}
          <li className="grid grid-cols-[18px_1fr_auto] items-center gap-2.5 text-ink-soft/70">
            <span className="flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-line" />
            <span className="text-xs sm:text-sm">Fixed and tested</span>
            <time className="font-mono text-xs">~45 min</time>
          </li>
        </ol>
      </article>
    </div>
  );
}
