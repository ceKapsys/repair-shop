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
import { AreasServed } from "@/components/site/areas-served";
import { waLink } from "@/lib/links";
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

  const phone = s.contacts.phones[0] || "(954) 955-7572";
  const whatsappNumber = s.contacts.whatsapp || "19549557572";
  const city = s.contacts.city || "Lauderhill & South Florida";
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
                <a
                  href={waLink(whatsappNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] bg-emergency px-6 text-base font-semibold text-on-primary shadow-xs transition-opacity hover:opacity-95"
                >
                  <span className="size-2 rounded-full bg-on-primary animate-pulse" />
                  <span>Emergency Booking</span>
                  <MessageCircle size={18} className="shrink-0" />
                </a>

                <Link
                  href="/book"
                  className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] border border-line bg-surface px-5 text-base font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-bg"
                >
                  <span>Book online</span>
                  <ArrowRight size={17} />
                </Link>
              </div>

              {/* Trust Matrix (Redesigned Hero Social Proof & Trust Badges) */}
              <div className="mt-10 border-t border-line pt-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(s.hero.trustItems && s.hero.trustItems.length > 0
                    ? s.hero.trustItems
                    : [
                        { icon: "shield", text: "Up to 180-day warranty" },
                        { icon: "eye", text: "Repaired in front of you" },
                        { icon: "tag", text: "Price agreed before start" },
                        { icon: "star", text: `${s.google.rating || 4.9} on Google (${s.google.ratingCount || 348}+ reviews)` },
                      ]
                  ).map((item, idx) => {
                    const isGoogle =
                      item.icon === "star" ||
                      item.text.toLowerCase().includes("google") ||
                      item.text.toLowerCase().includes("review");

                    if (isGoogle) {
                      const rating = s.google.rating || 4.9;
                      const count = s.google.ratingCount || 348;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-xl border border-line bg-surface/70 px-3.5 py-3 shadow-2xs transition-all hover:border-line-strong hover:bg-surface"
                        >
                          <div className="flex size-9.5 shrink-0 items-center justify-center rounded-lg border border-line bg-bg shadow-2xs">
                            <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                className="google-blue"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                className="google-green"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                className="google-yellow"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                className="google-red"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 leading-none">
                              <span className="font-mono text-sm font-bold text-ink">{rating}</span>
                              <div className="stars flex items-center gap-0.5" aria-hidden="true">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={12} />
                                ))}
                              </div>
                            </div>
                            <p className="mt-1 text-xs font-medium text-ink-soft">
                              Google Reviews ({count}+)
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 rounded-xl border border-line bg-surface/70 px-3.5 py-3 shadow-2xs transition-all hover:border-line-strong hover:bg-surface"
                      >
                        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-lg border border-line bg-bg text-primary shadow-2xs">
                          {item.icon === "eye" ? (
                            <Eye size={18} strokeWidth={2.2} />
                          ) : item.icon === "tag" ? (
                            <Tag size={18} strokeWidth={2.2} />
                          ) : (
                            <ShieldCheck size={18} strokeWidth={2.2} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink leading-snug truncate sm:text-clip">
                            {item.text}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-soft">
                            {item.icon === "eye"
                              ? "100% data safe · in front of you"
                              : item.icon === "tag"
                              ? "Agreed upfront · zero hidden fees"
                              : "Parts & labor fully guaranteed"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Visual Column (Photo Frame + Live Floating Ticket) */}
            <div>
              <HeroVisual
                ticketNo="RS-2611-0042"
                deviceTitle="iPhone 15 Pro · Screen replacement"
                location={s.serviceAreas[0] ? `${s.serviceAreas[0].name}` : "Margate (Center Hub), FL"}
                imageUrl={s.hero.image || "/images/hero-technician.jpg"}
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

          <ol className="steps">
            {(s.howItWorks && s.howItWorks.length > 0
              ? s.howItWorks
              : [
                  { step: "01", title: "Book in a minute.", text: "Tell us the device and the problem, pick a time." },
                  { step: "02", title: "We come to you.", text: "A certified technician arrives at your door with OEM parts." },
                  { step: "03", title: "Fixed on the spot.", text: "You inspect and test the repaired device, then pay." },
                ]
            ).map((stepItem, i) => (
              <li key={stepItem.step || i}>
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
          AREAS WE SERVE (#areas)
          ========================================================================= */}
      <AreasServed serviceAreas={s.serviceAreas} phone={phone} />

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
              <a
                href={waLink(whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] bg-emergency px-6 text-base font-semibold text-on-primary shadow-xs transition-opacity hover:opacity-95"
              >
                <span className="size-2 rounded-full bg-on-primary animate-pulse" />
                <span>Emergency Booking</span>
                <MessageCircle size={18} className="shrink-0" />
              </a>

              <Link
                href="/book"
                className="pressable inline-flex h-12 items-center justify-center gap-2 rounded-[var(--r-ctrl)] border border-ink bg-transparent px-6 text-base font-semibold text-ink transition-colors hover:bg-ink hover:text-bg"
              >
                <span>Book online</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
