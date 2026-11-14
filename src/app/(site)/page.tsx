import Link from "next/link";
import {
  ArrowRight,
  Eye,
  MessageCircle,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Tag,
} from "lucide-react";
import { BeforeAfterSlider } from "@/components/site/before-after-slider";
import { DevicePicker } from "@/components/site/device-picker";
import { HeroVisual } from "@/components/site/hero-visual";
import { JsonLd } from "@/components/site/json-ld";
import { PriceListRows } from "@/components/site/price-list-rows";
import { ReviewsGrid } from "@/components/site/reviews-grid";
import {
  getAllDevices,
  getBrands,
  getGallery,
  getPosts,
  getReviews,
  getServices,
} from "@/lib/data";
import { DAY_NAMES } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";

export default async function HomePage() {
  const [s, services, brands, devices, reviews, posts, gallery] = await Promise.all([
    getSettings(),
    getServices(),
    getBrands(),
    getAllDevices(),
    getReviews(),
    getPosts(),
    getGallery(),
  ]);

  const phone = s.contacts.phones[0] || "(305) 911-7372";
  const whatsappNumber = s.contacts.whatsapp || "13059117372";
  const city = s.contacts.city || "Miami & South Florida";
  const emergencyFee = s.emergency.fee
    ? `${s.currency === "USD" || !s.currency ? "$" : s.currency}${s.emergency.fee}`
    : "$35";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ElectronicsRepair",
          name: s.shopName,
          url: siteDefaults.url,
          telephone: phone,
          email: s.contacts.email,
          image: s.branding.logo || s.hero.image,
          address: {
            "@type": "PostalAddress",
            streetAddress: s.contacts.address,
            addressLocality: city,
          },
          areaServed: s.serviceAreas.map((a) => a.name),
          openingHoursSpecification: s.hours
            .filter((h) => !h.closed)
            .map((h) => ({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: DAY_NAMES[h.day],
              opens: h.open,
              closes: h.close,
            })),
          aggregateRating:
            s.google.rating && s.google.ratingCount
              ? {
                  "@type": "AggregateRating",
                  ratingValue: s.google.rating,
                  reviewCount: s.google.ratingCount,
                }
              : undefined,
          sameAs: Object.values(s.socials),
        }}
      />

      {/* =========================================================================
          HERO SECTION (#top)
          ========================================================================= */}
      <section className="pt-10 pb-16 md:pt-16 md:pb-22" id="top">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            {/* Left Copy Column */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-steel">
                {s.hero.eyebrow || `Doorstep repair in ${city}`}
              </p>

              <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-ink sm:text-5xl md:text-[60px] md:leading-[62px]">
                {s.hero.title || (
                  <>
                    Your device, fixed at{" "}
                    <em className="not-italic text-primary">your door.</em>
                  </>
                )}
              </h1>

              <p className="mt-5 max-w-[34em] text-lg leading-relaxed text-ink-soft sm:text-[19px]">
                {s.hero.sub ||
                  "Phones, laptops, tablets, consoles, watches and audio. A certified technician comes directly to you in Miami, Fort Lauderdale & Orlando."}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/book"
                  className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] bg-primary px-5 text-base font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-strong"
                >
                  <span>Book a repair</span>
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href="#emergency"
                  className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] border border-ink bg-transparent px-5 text-base font-semibold text-ink transition-colors hover:bg-ink hover:text-bg"
                >
                  <span className="dot" aria-hidden="true" />
                  <span>Emergency? Call now</span>
                </Link>
              </div>

              {/* Trust Matrix (Admin Configurable / Dynamic) */}
              <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-5 sm:grid-cols-2">
                {(s.hero.trustItems && s.hero.trustItems.length > 0
                  ? s.hero.trustItems
                  : [
                      { icon: "shield", text: "Up to 180-day warranty" },
                      { icon: "eye", text: "Repaired in front of you" },
                      { icon: "tag", text: "Price agreed before we start" },
                      { icon: "star", text: `${s.google.rating || 4.9} on Google (${s.google.ratingCount || 340}+ reviews)` },
                    ]
                ).map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-[15px] font-medium text-ink-soft">
                    {item.icon === "eye" ? (
                      <Eye size={18} className="shrink-0 text-steel" />
                    ) : item.icon === "tag" ? (
                      <Tag size={18} className="shrink-0 text-steel" />
                    ) : item.icon === "star" ? (
                      <span className="stars" aria-hidden="true">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={15} />
                        ))}
                      </span>
                    ) : (
                      <ShieldCheck size={18} className="shrink-0 text-steel" />
                    )}
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Visual Column (Photo Frame + Live Floating Ticket) */}
            <div>
              <HeroVisual
                ticketNo="RS-2611-0042"
                deviceTitle="iPhone 15 Pro · Screen replacement"
                location={s.serviceAreas[0] ? `${s.serviceAreas[0].name}, FL` : "Brickell Ave, Miami, FL"}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          DEVICE PICKER SECTION (#devices)
          ========================================================================= */}
      <section className="bg-surface py-20 md:py-24" id="devices" aria-labelledby="devices-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 id="devices-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                What needs fixing?
              </h2>
              <p className="mt-3 text-base text-ink-soft">
                Pick your device to see repairs and prices.
              </p>
            </div>
          </div>

          <DevicePicker dbBrands={brands} dbDevices={devices} />
        </div>
      </section>

      {/* =========================================================================
          THREE STEPS, NO SHOP VISIT (#how)
          ========================================================================= */}
      <section className="py-20 md:py-24" aria-labelledby="how-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <h2 id="how-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Three steps, no shop visit
            </h2>
          </div>

          <ol className="grid grid-cols-1 border-t border-line-strong pt-8 sm:grid-cols-3 sm:gap-8">
            {(s.howItWorks && s.howItWorks.length > 0
              ? s.howItWorks
              : [
                  { step: "01", title: "Book in a minute.", text: "Tell us the device and the problem, pick a time." },
                  { step: "02", title: "We come to you.", text: "A certified technician arrives at your door with OEM parts." },
                  { step: "03", title: "Fixed on the spot.", text: "You inspect and test the repaired device, then pay." },
                ]
            ).map((stepItem, i) => (
              <li key={stepItem.step || i} className="relative pb-8 pr-6 sm:pb-0">
                <span className="font-mono text-sm font-semibold text-steel">
                  {stepItem.step || `0${i + 1}`}
                </span>
                <h3 className="mt-2.5 font-heading text-xl font-semibold text-ink">
                  {stepItem.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {stepItem.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* =========================================================================
          COMMON REPAIRS - PRICE LIST ROWS (#repairs)
          ========================================================================= */}
      <section className="bg-surface py-20 md:py-24" id="repairs" aria-labelledby="repairs-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 id="repairs-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Common repairs
            </h2>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-strong"
            >
              <span>See all services</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <PriceListRows services={services} currency={s.currency} />
        </div>
      </section>

      {/* =========================================================================
          EMERGENCY NIGHT BAND (#emergency)
          ========================================================================= */}
      <section className="band py-20" id="emergency" aria-labelledby="em-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            {/* Left Emergency Text */}
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-night px-3.5 py-1.5 text-xs font-semibold text-on-primary mb-5">
                <span className="dot" />
                <span>{s.emergency.statusText || "Emergency service open today until 11:00 PM EST"}</span>
              </p>

              <h2 id="em-h" className="font-heading text-3xl font-semibold tracking-tight text-on-primary md:text-4xl">
                {s.emergency.title || "Can’t wait until tomorrow?"}
              </h2>

              <p className="mt-3.5 max-w-[44ch] text-base leading-relaxed text-mist md:text-lg">
                {s.emergency.body ||
                  `Emergency repairs today: a certified technician calls you within ${s.emergency.responseMinutes || 30} minutes of booking.`}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/emergency"
                  className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] bg-emergency px-5 text-sm font-semibold text-on-primary shadow-xs transition-opacity hover:opacity-90"
                >
                  Book emergency repair
                </Link>

                <a
                  href={`tel:${phone.replace(/\D/g, "")}`}
                  className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] border border-line-strong bg-transparent px-5 text-sm font-semibold text-on-primary transition-colors hover:border-line hover:bg-surface/10"
                >
                  <Phone size={16} />
                  <span>Call {phone}</span>
                </a>
              </div>
            </div>

            {/* Right Facts Box */}
            <div
              className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line-strong bg-line-strong shadow-card"
              aria-label="Today's emergency service facts"
            >
              <div className="flex items-baseline justify-between gap-4 bg-night p-5">
                <span className="text-sm text-mist">Callback within</span>
                <strong className="font-mono text-xl font-bold text-on-primary">
                  {s.emergency.responseMinutes || 30} min
                </strong>
              </div>
              <div className="flex items-baseline justify-between gap-4 bg-night p-5">
                <span className="text-sm text-mist">Emergency fee</span>
                <strong className="font-mono text-xl font-bold text-on-primary">{emergencyFee}</strong>
              </div>
              <div className="flex items-baseline justify-between gap-4 bg-night p-5">
                <span className="text-sm text-mist">Today&rsquo;s hours</span>
                <strong className="font-mono text-xl font-bold text-on-primary">
                  {s.emergency.hoursText || "8 AM–11 PM EST"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REVIEWS SECTION (#reviews)
          ========================================================================= */}
      <section className="py-20 md:py-24" id="reviews" aria-labelledby="rev-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <ReviewsGrid
            reviews={reviews}
            rating={s.google.rating || 4.9}
            ratingCount={s.google.ratingCount || 212}
          />
        </div>
      </section>

      {/* =========================================================================
          GALLERY - RECENT REPAIRS (#gallery)
          ========================================================================= */}
      <section className="bg-surface py-20 md:py-24" id="gallery" aria-labelledby="gal-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 id="gal-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Recent repairs
            </h2>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-strong"
            >
              <span>View gallery</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <BeforeAfterSlider galleryItems={gallery} />
        </div>
      </section>

      {/* =========================================================================
          REPAIR ADVICE / BLOG (#advice)
          ========================================================================= */}
      <section className="py-20 md:py-24" id="advice" aria-labelledby="blog-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
            <h2 id="blog-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              Repair advice
            </h2>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary-strong"
            >
              <span>All articles</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-2.5 border-t border-line-strong pt-5 transition-colors"
              >
                <div className="flex items-center gap-3 text-xs text-ink-soft">
                  <span className="font-semibold text-steel uppercase tracking-wider">
                    {post.tags?.[0] || "Guide"}
                  </span>
                  <span className="font-mono">{post.readingTime || 4} min read</span>
                </div>
                <h3 className="font-heading text-xl font-semibold text-ink group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">
                    {post.excerpt}
                  </p>
                )}
              </Link>
            ))}

            {posts.length === 0 && (
              <>
                <Link href="/blog" className="group flex flex-col gap-2.5 border-t border-line-strong pt-5">
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    <span className="font-semibold text-steel uppercase tracking-wider">Phones</span>
                    <span className="font-mono">4 min read</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-ink group-hover:text-primary">
                    Screen repair or replace: how to decide
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    What a cracked screen costs to fix, when a new phone makes more sense, and what to ask.
                  </p>
                </Link>

                <Link href="/blog" className="group flex flex-col gap-2.5 border-t border-line-strong pt-5">
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    <span className="font-semibold text-steel uppercase tracking-wider">Safety</span>
                    <span className="font-mono">3 min read</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-ink group-hover:text-primary">
                    Is doorstep repair safe for my data?
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    What our technicians can and can&rsquo;t see, and three things to do before any repair.
                  </p>
                </Link>

                <Link href="/blog" className="group flex flex-col gap-2.5 border-t border-line-strong pt-5">
                  <div className="flex items-center gap-3 text-xs text-ink-soft">
                    <span className="font-semibold text-steel uppercase tracking-wider">Batteries</span>
                    <span className="font-mono">5 min read</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-ink group-hover:text-primary">
                    Five signs your battery needs replacing
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Swelling, sudden shutdowns and slow charging: what each means and urgency.
                  </p>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =========================================================================
          FAQ SECTION (#faq)
          ========================================================================= */}
      <section className="bg-surface py-20 md:py-24" id="faq" aria-labelledby="faq-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 id="faq-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                Questions before you book
              </h2>
              <p className="mt-3 text-base text-ink-soft">
                Still unsure? Message us on WhatsApp and a technician will answer.
              </p>
            </div>

            <div className="divide-y divide-line-strong">
              {s.faqs.map((f, i) => (
                <details key={f.question} open={i === 0} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-lg font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span>{f.question}</span>
                    <Plus
                      size={18}
                      className="shrink-0 text-steel transition-transform duration-200 group-open:rotate-45"
                    />
                  </summary>
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-ink-soft">
                    {f.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FINAL CTA BOX (#contact)
          ========================================================================= */}
      <section className="py-20 md:py-24" id="contact" aria-labelledby="final-h">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-8 rounded-[20px] border border-line bg-surface p-8 md:p-12">
            <div>
              <h2 id="final-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                Ready when you are.
              </h2>
              <p className="mt-2.5 text-base text-ink-soft">
                Book online, message us on WhatsApp, or call{" "}
                <span className="font-mono font-medium text-ink">{phone}</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/book"
                className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] bg-primary px-6 text-base font-semibold text-on-primary shadow-xs transition-colors hover:bg-primary-strong"
              >
                Book a repair
              </Link>

              <a
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=Hi%20911%20Mobile%20Repair%20Shop%2C%20I%20need%20a%20repair.`}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] border border-ink bg-transparent px-6 text-base font-semibold text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                <MessageCircle size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
