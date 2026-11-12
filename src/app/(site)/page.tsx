import Link from "next/link";
import { BadgeCheck, CalendarClock, House, ShieldCheck, Siren, Wrench } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { JsonLd } from "@/components/site/json-ld";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";

const trust = [
  { icon: ShieldCheck, label: "Warranty on every repair" },
  { icon: BadgeCheck, label: "Genuine-grade parts" },
  { icon: House, label: "We come to your door" },
];

const steps = [
  { icon: Wrench, title: "Pick your repair", body: "Choose your device and the problem. See the price before you book." },
  { icon: CalendarClock, title: "Choose a time", body: "Pick a slot that suits you, or request an emergency visit." },
  { icon: House, title: "We fix it at your door", body: "A technician arrives, repairs the device, and you pay when it’s done." },
];

export default async function HomePage() {
  const s = await getSettings();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ElectronicsRepair",
          name: s.shopName,
          url: siteDefaults.url,
          telephone: s.contacts.phones[0],
          email: s.contacts.email,
          address: s.contacts.address,
        }}
      />

      <section className="mx-auto max-w-6xl px-4 pt-14 pb-16 md:pt-24 md:pb-24">
        <h1 className="max-w-3xl text-4xl font-extrabold md:text-6xl">{s.hero.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted md:text-xl">{s.hero.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/book" className={buttonVariants({ size: "lg" })}>
            Book a doorstep repair
          </Link>
          <Link href="/emergency" className={buttonVariants({ size: "lg", variant: "emergency" })}>
            <Siren size={20} strokeWidth={1.75} aria-hidden /> Emergency repair
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[15px] text-muted">
          {trust.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon size={20} strokeWidth={1.5} className="text-primary" aria-hidden /> {label}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="how" className="text-2xl font-bold md:text-3xl">How it works</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="rounded-[var(--radius-card)] border border-border bg-background p-6 shadow-1">
                <Icon size={24} strokeWidth={1.5} className="text-primary" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold">
                  <span className="text-muted">{i + 1}.</span> {title}
                </h3>
                <p className="mt-2 text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Week 3+: popular services, device picker, reviews, gallery strip, blog teasers, FAQ */}
    </>
  );
}
