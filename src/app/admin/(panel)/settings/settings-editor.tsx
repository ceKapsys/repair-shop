"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { FaqList, NumberInput, SelectInput, TextArea, TextInput, Toggle, useEntityForm, useForm } from "@/components/admin/form";
import { ImageUrlInput } from "@/components/admin/image-input";
import { inputClass, Switch } from "@/components/ui/field";
import { DAY_NAMES } from "@/lib/format";
import { slugify } from "@/lib/utils";
import { settingsInput } from "@/lib/validation/admin";
import { saveSettings } from "./actions";

const addBtn = "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary";
const removeBtn = "flex size-11 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-emergency/10 hover:text-emergency";

/** First validation error at or below a path, for list fields whose rows carry the errors. */
function useListError(name: string) {
  const f = useForm();
  const key = Object.keys(f.errors).find((k) => f.errors[k] && (k === name || k.startsWith(`${name}.`)));
  return key ? f.errors[key] : undefined;
}

function ListError({ name }: { name: string }) {
  const error = useListError(name);
  return error ? <p role="alert" className="mt-1.5 text-sm text-emergency">{error}</p> : null;
}

/** Editable list of plain strings (phones, alert emails). */
function StringList({ name, label, hint, placeholder, type = "text", addLabel }: { name: string; label: string; hint?: string; placeholder?: string; type?: string; addLabel: string }) {
  const f = useForm();
  const items = (f.get(name) ?? []) as string[];
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
      <div className="mt-2 space-y-2">
        {items.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type={type}
              value={v}
              placeholder={placeholder}
              aria-label={`${label} ${i + 1}`}
              aria-invalid={f.errors[`${name}.${i}`] ? true : undefined}
              onChange={(e) => f.set(name, items.map((x, j) => (j === i ? e.target.value : x)))}
              onBlur={() => f.blur(`${name}.${i}`)}
              className={`${inputClass} mt-0`}
            />
            <button type="button" aria-label={`Remove ${v || label}`} onClick={() => f.set(name, items.filter((_, j) => j !== i))} className={removeBtn}>
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <ListError name={name} />
      <button type="button" className={`${addBtn} mt-1`} onClick={() => f.set(name, [...items, ""])}>
        <Plus size={16} /> {addLabel}
      </button>
    </fieldset>
  );
}

function TimeCell({ name, label, disabled }: { name: string; label: string; disabled?: boolean }) {
  const f = useForm();
  return (
    <input
      type="time"
      aria-label={label}
      disabled={disabled}
      value={(f.get(name) ?? "") as string}
      aria-invalid={f.errors[name] ? true : undefined}
      onChange={(e) => f.set(name, e.target.value)}
      onBlur={() => f.blur(name)}
      className={`${inputClass} mt-0 w-32`}
    />
  );
}

function HoursTable() {
  const f = useForm();
  return (
    <div className="divide-y divide-line">
      {DAY_NAMES.map((day, i) => {
        const closed = Boolean(f.get(`hours.${i}.closed`));
        return (
          <div key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
            <span className="w-28 text-sm font-medium">{day}</span>
            <Switch id={`hours-open-${i}`} label={<span className="text-sm font-normal text-ink-soft">{closed ? "Closed" : "Open"}</span>} checked={!closed} onChange={(v) => f.set(`hours.${i}.closed`, !v)} className="w-32 items-center" />
            <div className="flex items-center gap-2">
              <TimeCell name={`hours.${i}.open`} label={`${day} opens`} disabled={closed} />
              <span className="text-ink-soft">to</span>
              <TimeCell name={`hours.${i}.close`} label={`${day} closes`} disabled={closed} />
            </div>
          </div>
        );
      })}
      <ListError name="hours" />
    </div>
  );
}

function EmergencyTable() {
  const f = useForm();
  return (
    <div className="divide-y divide-line">
      {DAY_NAMES.map((day, i) => {
        const on = Boolean(f.get(`emergency.schedule.${i}.enabled`));
        const rm = `emergency.schedule.${i}.responseMinutes`;
        return (
          <div key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5">
            <span className="w-28 text-sm font-medium">{day}</span>
            <Switch id={`em-on-${i}`} label={<span className="text-sm font-normal text-ink-soft">{on ? "Available" : "Off"}</span>} checked={on} onChange={(v) => f.set(`emergency.schedule.${i}.enabled`, v)} className="w-36 items-center" />
            <div className="flex items-center gap-2">
              <TimeCell name={`emergency.schedule.${i}.open`} label={`${day} emergency from`} disabled={!on} />
              <span className="text-ink-soft">to</span>
              <TimeCell name={`emergency.schedule.${i}.close`} label={`${day} emergency until`} disabled={!on} />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              Call back within
              <input
                type="number"
                min={1}
                max={1440}
                disabled={!on}
                value={(f.get(rm) ?? "") as number | ""}
                aria-invalid={f.errors[rm] ? true : undefined}
                onChange={(e) => f.set(rm, e.target.value === "" ? "" : Number(e.target.value))}
                onBlur={() => f.blur(rm)}
                className={`${inputClass} mt-0 w-20`}
              />
              min
            </label>
          </div>
        );
      })}
      <ListError name="emergency.schedule" />
    </div>
  );
}

function WindowsList() {
  const f = useForm();
  const items = (f.get("bookingSlots.windows") ?? []) as string[];
  const write = (next: string[]) => f.set("bookingSlots.windows", next);
  const part = (w: string, n: 0 | 1) => w.split("-")[n] ?? "";
  return (
    <fieldset>
      <legend className="text-sm font-medium">Visit time windows</legend>
      <p className="text-sm text-ink-soft">Customers pick one of these windows for each bookable day.</p>
      <div className="mt-2 space-y-2">
        {items.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <input type="time" aria-label={`Window ${i + 1} start`} value={part(w, 0)} onChange={(e) => write(items.map((x, j) => (j === i ? `${e.target.value}-${part(x, 1)}` : x)))} className={`${inputClass} mt-0 w-32`} />
            <span className="text-ink-soft">to</span>
            <input type="time" aria-label={`Window ${i + 1} end`} value={part(w, 1)} onChange={(e) => write(items.map((x, j) => (j === i ? `${part(x, 0)}-${e.target.value}` : x)))} className={`${inputClass} mt-0 w-32`} />
            <button type="button" aria-label={`Remove window ${i + 1}`} onClick={() => write(items.filter((_, j) => j !== i))} className={removeBtn}>
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <ListError name="bookingSlots.windows" />
      <button type="button" className={`${addBtn} mt-1`} onClick={() => write([...items, "09:00-12:00"])}>
        <Plus size={16} /> Add window
      </button>
    </fieldset>
  );
}

function ClosedDays() {
  const f = useForm();
  const closed = new Set((f.get("bookingSlots.closedDays") ?? []) as number[]);
  return (
    <fieldset>
      <legend className="text-sm font-medium">Days with no visits</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {DAY_NAMES.map((d, i) => (
          <label key={d} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-input border px-3 text-sm ${closed.has(i) ? "border-emergency/40 bg-emergency/5 text-emergency" : "border-line"}`}>
            <input
              type="checkbox"
              checked={closed.has(i)}
              onChange={(e) => {
                const next = new Set(closed);
                if (e.target.checked) next.add(i);
                else next.delete(i);
                f.set("bookingSlots.closedDays", Array.from(next).sort());
              }}
              className="size-4 accent-emergency"
            />
            {d.slice(0, 3)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function AreasList() {
  const f = useForm();
  const items = (f.get("serviceAreas") ?? []) as { name: string; slug: string; note?: string }[];
  const write = (next: typeof items) => f.set("serviceAreas", next);
  return (
    <div>
      <div className="space-y-3">
        {items.map((a, i) => (
          <div key={i} className="grid gap-2 rounded-input border border-line p-3 sm:grid-cols-[1fr_1.5fr_auto]">
            <input
              aria-label={`Area ${i + 1} name`}
              placeholder="Area name"
              value={a.name}
              aria-invalid={f.errors[`serviceAreas.${i}.name`] || f.errors[`serviceAreas.${i}.slug`] ? true : undefined}
              onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, name: e.target.value, slug: slugify(e.target.value) } : x)))}
              onBlur={() => f.blur(`serviceAreas.${i}.name`)}
              className={`${inputClass} mt-0`}
            />
            <input aria-label={`Area ${i + 1} note`} placeholder="Note (optional), e.g. “Same-day visits”" value={a.note ?? ""} onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, note: e.target.value } : x)))} className={`${inputClass} mt-0`} />
            <button type="button" aria-label={`Remove ${a.name || "area"}`} onClick={() => write(items.filter((_, j) => j !== i))} className={removeBtn}>
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <ListError name="serviceAreas" />
      <button type="button" className={`${addBtn} mt-1`} onClick={() => write([...items, { name: "", slug: "", note: "" }])}>
        <Plus size={16} /> Add area
      </button>
    </div>
  );
}

function TrustItemsList() {
  const f = useForm();
  const items = (f.get("hero.trustItems") ?? []) as { icon: string; text: string }[];
  const write = (next: typeof items) => f.set("hero.trustItems", next);
  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {items.map((t, i) => (
          <div key={i} className="grid gap-2 rounded-input border border-line p-3 sm:grid-cols-[140px_1fr_auto]">
            <input
              aria-label={`Trust item ${i + 1} icon`}
              placeholder="Icon (shield, eye, tag, star)"
              value={t.icon}
              onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))}
              className={`${inputClass} mt-0`}
            />
            <input
              aria-label={`Trust item ${i + 1} text`}
              placeholder="Text, e.g. Up to 180-day warranty"
              value={t.text}
              onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
              className={`${inputClass} mt-0`}
            />
            <button type="button" aria-label={`Remove trust item ${i + 1}`} onClick={() => write(items.filter((_, j) => j !== i))} className={removeBtn}>
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <ListError name="hero.trustItems" />
      <button
        type="button"
        className={`${addBtn} mt-1`}
        onClick={() => write([...items, { icon: "shield", text: "" }])}
      >
        <Plus size={16} /> Add trust bullet
      </button>
    </div>
  );
}

function HowItWorksList() {
  const f = useForm();
  const items = (f.get("howItWorks") ?? []) as { step: string; title: string; text: string }[];
  const write = (next: typeof items) => f.set("howItWorks", next);
  return (
    <div className="space-y-3">
      <div className="space-y-3">
        {items.map((s, i) => (
          <div key={i} className="grid gap-2 rounded-input border border-line p-3 sm:grid-cols-[80px_1fr_1.5fr_auto]">
            <input
              aria-label={`Step ${i + 1} number`}
              placeholder="01"
              value={s.step}
              onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, step: e.target.value } : x)))}
              className={`${inputClass} mt-0`}
            />
            <input
              aria-label={`Step ${i + 1} title`}
              placeholder="Step title"
              value={s.title}
              onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))}
              className={`${inputClass} mt-0`}
            />
            <input
              aria-label={`Step ${i + 1} description`}
              placeholder="Step explanation text"
              value={s.text}
              onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))}
              className={`${inputClass} mt-0`}
            />
            <button type="button" aria-label={`Remove step ${i + 1}`} onClick={() => write(items.filter((_, j) => j !== i))} className={removeBtn}>
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      <ListError name="howItWorks" />
      <button
        type="button"
        className={`${addBtn} mt-1`}
        onClick={() => write([...items, { step: `0${items.length + 1}`, title: "", text: "" }])}
      >
        <Plus size={16} /> Add step
      </button>
    </div>
  );
}

export function SettingsEditor({ initial, emailConfigured, uploadsConfigured }: { initial: Record<string, unknown>; emailConfigured: boolean; uploadsConfigured: boolean }) {
  const router = useRouter();
  const form = useEntityForm({ initial, schema: settingsInput, save: saveSettings, onSaved: () => router.refresh() });
  const zones = useMemo(() => {
    let all: string[] = [];
    try {
      all = Intl.supportedValuesOf("timeZone");
    } catch {
      /* older browsers: fall back to the saved value only */
    }
    return Array.from(new Set(["UTC", String(initial.timezone ?? "UTC"), ...all])).map((z) => ({ value: z, label: z.replace(/_/g, " ") }));
  }, [initial.timezone]);
  const currency = String(form.values.currency ?? "");

  return (
    <EditorShell
      form={form}
      title="Settings"
      saveLabel="Save settings"
      tabs={[
        {
          id: "general",
          label: "Shop",
          fields: ["shopName", "tagline", "timezone", "currency", "hero", "howItWorks", "branding"],
          content: (
            <div className="max-w-3xl space-y-6">
              <Section title="Shop">
                <TextInput name="shopName" label="Shop name" />
                <TextInput name="tagline" label="Tagline" counter={{ max: 120 }} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput name="timezone" label="Time zone" options={zones} hint="Booking slots and emergency hours use this time zone." />
                  <TextInput name="currency" label="Currency" placeholder="USD" hint="3-letter code, e.g. USD, GBP, EUR." />
                </div>
              </Section>
              <Section title="Home page hero">
                <p className="text-sm text-ink-soft">Leave these empty to use the standard wording. Fill one in only to replace it.</p>
                <TextInput name="hero.eyebrow" label="Small label above the headline (optional)" counter={{ max: 60 }} />
                <TextInput name="hero.title" label="Headline (optional)" hint="Eight words or fewer reads best." counter={{ max: 80 }} />
                <TextArea name="hero.sub" label="Supporting text (optional)" counter={{ max: 300 }} />
                <ImageUrlInput name="hero.image" label="Hero image" folder="branding" />
                <div className="pt-3">
                  <label className="block text-sm font-medium text-ink mb-2">Trust bullets in hero</label>
                  <TrustItemsList />
                </div>
              </Section>
              <Section title="How it works (3 steps)" description="Shown on the home page below the device picker.">
                <HowItWorksList />
              </Section>
              <Section title="Branding" description={uploadsConfigured ? undefined : "Image uploads need Cloudinary keys — until then, paste image URLs."}>
                <ImageUrlInput name="branding.logo" label="Logo" folder="branding" />
                <ImageUrlInput name="branding.logoDark" label="Logo for dark mode" folder="branding" />
                <ImageUrlInput name="branding.favicon" label="Favicon" folder="branding" hint="Square PNG, SVG or ICO." />
              </Section>
            </div>
          ),
        },
        {
          id: "contact",
          label: "Contact",
          fields: ["contacts", "socials"],
          content: (
            <div className="max-w-3xl space-y-6">
              <Section title="Phone and WhatsApp">
                <StringList name="contacts.phones" label="Phone numbers" hint="The first number is used for the Call button." placeholder="+1 555 010 0000" type="tel" addLabel="Add phone" />
                <TextInput name="contacts.whatsapp" label="WhatsApp number" placeholder="15550100000" hint="Digits only, with country code." />
              </Section>
              <Section title="Email and address">
                <TextInput name="contacts.email" label="Public email" type="email" />
                <TextArea name="contacts.address" label="Shop address" rows={2} />
                <TextInput name="contacts.city" label="City" />
                <TextInput name="contacts.mapEmbed" label="Google Maps embed URL" placeholder="https://www.google.com/maps/embed?pb=…" hint="Google Maps › Share › Embed a map — paste only the src URL." />
              </Section>
              <Section title="Social profiles">
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput name="socials.facebook" label="Facebook" placeholder="https://facebook.com/…" />
                  <TextInput name="socials.instagram" label="Instagram" placeholder="https://instagram.com/…" />
                  <TextInput name="socials.tiktok" label="TikTok" placeholder="https://tiktok.com/@…" />
                  <TextInput name="socials.youtube" label="YouTube" placeholder="https://youtube.com/@…" />
                  <TextInput name="socials.x" label="X" placeholder="https://x.com/…" />
                </div>
              </Section>
            </div>
          ),
        },
        {
          id: "hours",
          label: "Hours and areas",
          fields: ["hours", "serviceAreas"],
          content: (
            <div className="max-w-3xl space-y-6">
              <Section title="Opening hours" description="Shown on the contact page and in Google results.">
                <HoursTable />
              </Section>
              <Section title="Service areas" description="Customers choose one of these when they book.">
                <AreasList />
              </Section>
            </div>
          ),
        },
        {
          id: "booking",
          label: "Booking",
          fields: ["bookingSlots", "emergency"],
          content: (
            <div className="max-w-3xl space-y-6">
              <Section title="Standard bookings">
                <WindowsList />
                <div className="grid gap-5 sm:grid-cols-3">
                  <NumberInput name="bookingSlots.maxPerSlot" label="Visits per window" step="1" hint="A window closes when it’s full." />
                  <NumberInput name="bookingSlots.leadTimeHours" label="Notice needed (hours)" hint="How far ahead a visit must be booked." />
                  <NumberInput name="bookingSlots.daysAhead" label="Bookable days ahead" step="1" />
                </div>
                <ClosedDays />
              </Section>
              <Section title="Emergency repairs" description="Set emergency repair call-out fee and weekly schedule. The public website automatically checks today's date and shows only today's open hours.">
                <Toggle name="emergency.enabled" label="Offer emergency repairs" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <NumberInput name="emergency.fee" label="Emergency call-out fee" prefix={currency} hint="Call-out fee charged for emergency repairs (e.g. 35). Set to 0 for free." className="max-w-xs" />
                  <NumberInput name="emergency.responseMinutes" label="Callback response ETA (min)" hint="Minutes to callback, e.g. 30." className="max-w-xs" />
                </div>
                <TextInput name="emergency.title" label="Emergency headline (optional)" placeholder="Can't wait until tomorrow?" counter={{ max: 120 }} />
                <TextArea name="emergency.body" label="Emergency explanation text (optional)" placeholder="Emergency repairs in Florida: a certified technician calls you within 30 minutes of booking." counter={{ max: 300 }} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextInput name="emergency.hoursText" label="Hours badge (optional override)" hint="Leave blank to auto-display today's hours from the schedule below" placeholder="Auto-calculated from today's schedule" counter={{ max: 80 }} />
                  <TextInput name="emergency.statusText" label="Live status badge (optional override)" hint="Leave blank to auto-calculate live open/closed status" placeholder="Auto-calculated from today's schedule" counter={{ max: 120 }} />
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-semibold text-ink">Weekly Emergency Schedule</h4>
                  <p className="text-xs text-ink-soft">
                    Fix and adjust the schedule per day. The website checks the current day in your shop&apos;s timezone and displays only today&apos;s available hours.
                  </p>
                </div>
                <EmergencyTable />
              </Section>
            </div>
          ),
        },
        {
          id: "alerts",
          label: "Alerts",
          fields: ["alertEmails", "notifications", "analytics"],
          content: (
            <div className="max-w-3xl space-y-6">
              <Section title="Booking alerts" description={emailConfigured ? "Every new booking is emailed to these addresses." : "Email sending is not configured yet (RESEND_API_KEY). Alerts are logged on the server but not sent."}>
                <StringList name="alertEmails" label="Send new bookings to" placeholder="owner@example.com" type="email" addLabel="Add email" />
              </Section>
              <Section title="Customer emails">
                <Toggle name="notifications.customerConfirmation" label="Booking confirmation" hint="Sent when a customer leaves an email address." />
                <Toggle name="notifications.statusUpdates" label="Status updates" hint="Lets you email the customer when you change a booking’s status." />
              </Section>
              <Section title="Analytics">
                <TextInput name="analytics.ga4Id" label="Google Analytics 4 ID" placeholder="G-XXXXXXXXXX" />
                <TextInput name="analytics.searchConsoleVerification" label="Search Console verification code" hint="The content value of the google-site-verification meta tag." />
              </Section>
            </div>
          ),
        },
        {
          id: "faqs",
          label: "FAQs",
          fields: ["faqs"],
          content: (
            <div className="max-w-3xl">
              <Section>
                <FaqList name="faqs" label="General questions" />
              </Section>
            </div>
          ),
        },
      ]}
    />
  );
}
