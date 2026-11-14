"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Check, ChevronLeft, ImagePlus, Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { submitBooking } from "@/app/(site)/book/actions";
import { Button } from "@/components/ui/button";
import { inputClass, textareaClass } from "@/components/ui/field";
import { copy, fill } from "@/content/copy";
import { track } from "@/lib/analytics";
import type { BookingCatalog, BookingDevice, BookingService } from "@/lib/booking-types";
import { estimateLabel, formatMoney, priceText, repairPriceLabel } from "@/lib/format";
import { telLink } from "@/lib/links";
import { dur, ease } from "@/lib/motion";
import { formatLocalDate, formatWindow } from "@/lib/time";
import { uploadImage } from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { EMAIL_RE, MAX_PHOTO_BYTES, normalisePhone } from "@/lib/validation/booking";
import { ServiceIcon } from "./service-icon";
import { Turnstile } from "./turnstile";

type SlotDay = { date: string; windows: { window: string; available: boolean }[] };
type Mode = "standard" | "emergency";
type StepId = "device" | "problem" | "place" | "contact" | "what" | "where";

const b = copy.booking;
const e = copy.errors;
const OUTSIDE = "__outside__";

/** Standard: four steps. Emergency: one screen for device + problem, one for address + phone. */
const STEPS: Record<Mode, StepId[]> = { standard: ["device", "problem", "place", "contact"], emergency: ["what", "where"] };

/** Which step owns a server-side field error, so we can jump back to it. */
const fieldStep = (mode: Mode, field: string): StepId => {
  if (mode === "emergency") return field.startsWith("address") || field.startsWith("customer") ? "where" : "what";
  if (field.startsWith("device")) return "device";
  if (field.startsWith("preferredSlot") || field.startsWith("address")) return "place";
  if (field.startsWith("customer")) return "contact";
  return "problem";
};

function availableServices(services: BookingService[], device: BookingDevice | undefined, mode: Mode) {
  const list = services.filter((s) => !device || device.repairs.some((r) => r.serviceId === s.id) || s.deviceIds.includes(device.id) || s.deviceIds.length === 0);
  if (mode === "emergency" && list.some((s) => s.isEmergencyAvailable)) return list.filter((s) => s.isEmergencyAvailable);
  return list;
}

function FieldError({ id, msg }: { id: string; msg?: string }) {
  return (
    <p id={id} aria-live="polite" className={msg ? "mt-1.5 text-sm leading-5 text-emergency" : "sr-only"}>
      {msg}
    </p>
  );
}

const labelClass = "text-sm leading-5 font-medium";

type Saved = {
  step: number; brandId: string; deviceId: string; customDevice: string; notListed: boolean; serviceIds: string[]; somethingElse: boolean;
  issueNote: string; photos: string[]; date: string; window: string; address: { line: string; area: string; mapLink: string };
  customer: { name: string; phone: string; whatsapp: boolean; email: string };
};

export function BookingForm({
  mode, catalog, slotDays = [], areas, currency, phone, initialDeviceId, initialServiceSlug, turnstileSiteKey, uploadsEnabled, emergencyFee, responseMinutes,
}: {
  mode: Mode;
  catalog: BookingCatalog;
  slotDays?: SlotDay[];
  areas: { name: string; slug: string }[];
  currency: string;
  /** Shop phone, shown in the outside-area and error copy. */
  phone: string;
  initialDeviceId?: string;
  initialServiceSlug?: string;
  turnstileSiteKey?: string;
  uploadsEnabled: boolean;
  emergencyFee?: number;
  responseMinutes?: number;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const steps = STEPS[mode];
  const storageKey = `booking:${mode}`;
  const initialDevice = catalog.devices.find((d) => d.id === initialDeviceId);
  const initialService = catalog.services.find((s) => s.slug === initialServiceSlug);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [brandId, setBrandId] = useState(initialDevice?.brandId ?? "");
  const [deviceId, setDeviceId] = useState(initialDevice?.id ?? "");
  const [customDevice, setCustomDevice] = useState("");
  const [notListed, setNotListed] = useState(catalog.devices.length === 0);
  const [query, setQuery] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>(initialService ? [initialService.id] : []);
  const [somethingElse, setSomethingElse] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [date, setDate] = useState(slotDays[0]?.date ?? "");
  const [window_, setWindow] = useState("");
  const [address, setAddress] = useState({ line: "", area: areas.length === 1 ? areas[0].slug : "", mapLink: "" });
  const [customer, setCustomer] = useState({ name: "", phone: "", whatsapp: true, email: "" });
  const [website, setWebsite] = useState("");
  const [token, setToken] = useState<string>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);
  const started = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Restore an unfinished booking after a refresh. A device or repair in the URL wins over the saved one.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const s = JSON.parse(raw) as Saved;
        if (!initialDevice) {
          if (catalog.devices.some((d) => d.id === s.deviceId)) setDeviceId(s.deviceId);
          setBrandId(s.brandId ?? "");
          setCustomDevice(s.customDevice ?? "");
          setNotListed(Boolean(s.notListed) || catalog.devices.length === 0);
        }
        if (!initialService) setServiceIds((s.serviceIds ?? []).filter((id) => catalog.services.some((x) => x.id === id)));
        setSomethingElse(Boolean(s.somethingElse));
        setIssueNote(s.issueNote ?? "");
        setPhotos(Array.isArray(s.photos) ? s.photos.slice(0, 3) : []);
        const day = slotDays.find((d) => d.date === s.date);
        if (day) {
          setDate(day.date);
          if (day.windows.some((w) => w.window === s.window && w.available)) setWindow(s.window);
        }
        if (s.address) setAddress((a) => ({ ...a, ...s.address }));
        if (s.customer) setCustomer((c) => ({ ...c, ...s.customer }));
        if (!initialDevice && !initialService && Number.isInteger(s.step)) setStep(Math.min(Math.max(s.step, 0), steps.length - 1));
      }
    } catch {
      // Unreadable or blocked storage: start fresh.
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) return;
    const data: Saved = { step, brandId, deviceId, customDevice, notListed, serviceIds, somethingElse, issueNote, photos, date, window: window_, address, customer };
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Storage full or blocked: the form still works, it just won't survive a refresh.
    }
  }, [restored, storageKey, step, brandId, deviceId, customDevice, notListed, serviceIds, somethingElse, issueNote, photos, date, window_, address, customer]);

  const device = catalog.devices.find((d) => d.id === deviceId);
  const brand = catalog.brands.find((x) => x.id === (device?.brandId ?? brandId));
  const services = useMemo(() => availableServices(catalog.services, device, mode), [catalog.services, device, mode]);
  const picked = serviceIds.map((id) => catalog.services.find((s) => s.id === id)).filter(Boolean) as BookingService[];
  const estimate = estimateLabel(picked.map((s) => ({ service: s, repair: device?.repairs.find((r) => r.serviceId === s.id) })), currency);
  const deviceLabel = device ? `${brand?.name ?? ""} ${device.model}`.trim() : customDevice.trim();
  const day = slotDays.find((d) => d.date === date);
  const outside = address.area === OUTSIDE;

  // Drop repairs that don't apply to a newly chosen device.
  useEffect(() => {
    if (restored) setServiceIds((ids) => ids.filter((id) => services.some((s) => s.id === id)));
  }, [services, restored]);

  const touch = () => {
    if (started.current) return;
    started.current = true;
    track("booking_start", { type: mode });
  };

  /* ------------------------------------------------------------ validation */

  const checks: Record<string, () => string | undefined> = {
    device: () => (!deviceId && customDevice.trim().length < 2 ? e.pickDevice : undefined),
    serviceIds: () => (!serviceIds.length && issueNote.trim().length < 3 ? e.pickProblem : undefined),
    "preferredSlot.date": () => (mode === "standard" && !date ? e.pickDate : undefined),
    "preferredSlot.window": () => (mode === "standard" && date && !window_ ? e.pickWindow : undefined),
    "address.area": () => (!address.area ? e.pickArea : outside ? fill(b.when.outside, { phone }) : undefined),
    "address.line": () => (address.line.trim().length < 5 ? fill(e.required, { field: copy.fields.address }) : undefined),
    "customer.name": () => (customer.name.trim().length < 2 ? fill(e.required, { field: copy.fields.name }) : undefined),
    "customer.phone": () => (!customer.phone.trim() ? fill(e.required, { field: copy.fields.phone }) : normalisePhone(customer.phone) ? undefined : e.phone),
    "customer.email": () => (customer.email.trim() && !EMAIL_RE.test(customer.email.trim()) ? e.email : undefined),
  };
  const STEP_FIELDS: Record<StepId, string[]> = {
    device: ["device"],
    problem: ["serviceIds"],
    place: ["preferredSlot.date", "preferredSlot.window", "address.area", "address.line"],
    contact: ["customer.name", "customer.phone", "customer.email"],
    what: ["device", "serviceIds"],
    where: ["address.area", "address.line", "customer.name", "customer.phone"],
  };
  const validate = (id: StepId) => {
    const out: Record<string, string> = {};
    for (const f of STEP_FIELDS[id]) {
      const msg = checks[f]();
      if (msg) out[f] = msg;
    }
    return out;
  };
  /** Validate one field when it loses focus. */
  const blur = (field: string) => setErrors((x) => ({ ...x, [field]: checks[field]() ?? "" }));

  const focusFirstInvalid = () =>
    requestAnimationFrame(() => document.querySelector<HTMLElement>("[data-booking] [aria-invalid=true], [data-booking] [data-invalid=true]")?.focus());

  const go = (i: number) => {
    setDir(i > step ? 1 : -1);
    setStep(i);
    setFormError("");
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  };

  const next = () => {
    const found = validate(steps[step]);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstInvalid();
    go(step + 1);
  };

  const submit = async () => {
    for (let i = 0; i < steps.length; i++) {
      const found = validate(steps[i]);
      if (Object.keys(found).length) {
        setErrors(found);
        if (i !== step) go(i);
        return focusFirstInvalid();
      }
    }
    setSubmitting(true);
    setFormError("");
    const payload = {
      type: mode,
      device: device ? { deviceId: device.id } : { customDevice: customDevice.trim() },
      serviceIds,
      issueNote: issueNote.trim() || undefined,
      photos,
      ...(mode === "standard" ? { preferredSlot: { date, window: window_ } } : {}),
      address: { line: address.line.trim(), area: address.area, mapLink: address.mapLink.trim() || undefined },
      customer: { name: customer.name.trim(), phone: customer.phone.trim(), whatsapp: customer.whatsapp, email: customer.email.trim() || undefined },
      turnstileToken: token,
      website: website || undefined,
    };
    try {
      const r = await submitBooking(payload);
      if (r.ok) {
        track(mode === "emergency" ? "emergency_submit" : "booking_submit", { services: picked.length, has_device: Boolean(device) });
        try {
          sessionStorage.removeItem(storageKey);
          sessionStorage.setItem("booking:done", JSON.stringify({ bookingNo: r.bookingNo, phone: customer.phone.trim() }));
        } catch {}
        router.push(`/book/success?no=${encodeURIComponent(r.bookingNo)}&type=${mode}${responseMinutes ? `&m=${responseMinutes}` : ""}`);
        return;
      }
      setFormError(r.error);
      if (r.fieldErrors) {
        setErrors(r.fieldErrors);
        const first = Object.keys(r.fieldErrors)[0];
        const idx = first ? steps.indexOf(fieldStep(mode, first)) : -1;
        if (idx >= 0 && idx !== step) go(idx);
        focusFirstInvalid();
      }
    } catch {
      // Network failure: everything typed so far is still in sessionStorage.
      setFormError(e.send);
    } finally {
      setSubmitting(false);
    }
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 3 - photos.length);
    if (list.some((f) => f.size > MAX_PHOTO_BYTES)) return setErrors((x) => ({ ...x, photos: e.photoSize }));
    setErrors((x) => ({ ...x, photos: "" }));
    setUploading(true);
    try {
      const out: string[] = [];
      for (const f of list) out.push((await uploadImage(f, "bookings")).url);
      setPhotos((p) => [...p, ...out].slice(0, 3));
    } catch {
      setErrors((x) => ({ ...x, photos: fill(e.server, { phone }) }));
    } finally {
      setUploading(false);
    }
  };

  const last = step === steps.length - 1;
  const selectable = (on: boolean) => cn("border", on ? "border-mist bg-mist text-ink" : "border-line bg-bg hover:bg-surface");

  /* ------------------------------------------------------------------ parts */

  const devicePart = () => {
    const q = query.trim().toLowerCase();
    const matches = q ? catalog.devices.filter((d) => `${catalog.brands.find((x) => x.id === d.brandId)?.name ?? ""} ${d.model}`.toLowerCase().includes(q)).slice(0, 12) : [];
    const models = catalog.devices.filter((d) => d.brandId === brandId);
    const types = (Object.keys(copy.deviceTypes) as (keyof typeof copy.deviceTypes)[])
      .map((t) => ({ t, items: catalog.brands.filter((x) => x.deviceType === t) }))
      .filter((g) => g.items.length);
    const choose = (d: BookingDevice) => {
      touch();
      setDeviceId(d.id);
      setBrandId(d.brandId);
      setCustomDevice("");
      setErrors((x) => ({ ...x, device: "" }));
    };
    return (
      <div className="grid gap-5">
        <h2>{b.device.title}</h2>
        {device && (
          <div className="flex items-center gap-3 rounded-card border border-mist bg-mist p-4 text-ink">
            <Check size={20} strokeWidth={1.75} aria-hidden />
            <span className="flex-1 font-medium">{deviceLabel}</span>
            <button type="button" onClick={() => setDeviceId("")} className="min-h-11 px-2 text-sm font-medium underline underline-offset-4">{b.device.change}</button>
          </div>
        )}
        {!device && !notListed && catalog.devices.length > 0 && (
          <>
            <label className="relative block">
              <span className="sr-only">{b.device.searchPlaceholder}</span>
              <Search size={20} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-steel" aria-hidden />
              <input type="search" value={query} onChange={(ev) => setQuery(ev.target.value)} placeholder={b.device.searchPlaceholder} className={`${inputClass} mt-0 h-12 pl-10`} autoComplete="off" data-invalid={errors.device ? true : undefined} />
            </label>
            {q ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {matches.length === 0 && <li className="text-ink-soft">{copy.misc.noModelMatch}</li>}
                {matches.map((d) => (
                  <li key={d.id}>
                    <button type="button" onClick={() => choose(d)} className={cn("flex min-h-12 w-full items-center rounded-input px-4 text-left font-medium", selectable(false))}>
                      {catalog.brands.find((x) => x.id === d.brandId)?.name} {d.model}
                    </button>
                  </li>
                ))}
              </ul>
            ) : brandId ? (
              <div>
                <button type="button" onClick={() => setBrandId("")} className="mb-2 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink">
                  <ChevronLeft size={20} strokeWidth={1.75} aria-hidden /> {brand?.name}
                </button>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {models.map((d) => (
                    <li key={d.id}>
                      <button type="button" onClick={() => choose(d)} className={cn("flex min-h-12 w-full items-center justify-center rounded-input px-3 text-center text-[15px] leading-5 font-medium", selectable(false))}>
                        {d.model}
                      </button>
                    </li>
                  ))}
                  {models.length === 0 && <li className="col-span-full text-ink-soft">{copy.misc.noModels}</li>}
                </ul>
              </div>
            ) : (
              <div className="grid gap-4">
                {types.map(({ t, items }) => (
                  <fieldset key={t}>
                    <legend className={`${labelClass} mb-2 text-ink-soft`}>{copy.deviceTypes[t]}</legend>
                    <div className="flex flex-wrap gap-2">
                      {items.map((x) => (
                        <button key={x.id} type="button" onClick={() => { touch(); setBrandId(x.id); }} className={cn("min-h-11 rounded-full px-4 text-sm font-medium", selectable(false))}>
                          {x.name}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
          </>
        )}
        {!device && (
          <div>
            {catalog.devices.length > 0 && (
              <button type="button" aria-expanded={notListed} onClick={() => setNotListed((v) => !v)} className="min-h-11 text-[15px] font-medium text-primary underline-offset-4 hover:text-primary-strong hover:underline">
                {b.device.notListed}
              </button>
            )}
            {notListed && (
              <div className="mt-2">
                <label htmlFor="custom-device" className={labelClass}>{b.device.customLabel}</label>
                <input id="custom-device" value={customDevice} onChange={(ev) => { touch(); setCustomDevice(ev.target.value); }} onBlur={() => blur("device")} aria-invalid={errors.device ? true : undefined} aria-describedby="err-device" className={`${inputClass} h-12`} maxLength={120} />
              </div>
            )}
          </div>
        )}
        <FieldError id="err-device" msg={errors.device} />
      </div>
    );
  };

  const problemPart = () => (
    <div className="grid gap-5">
      <h2>{b.problem.title}</h2>
      <fieldset aria-describedby="err-services">
        <legend className="text-ink-soft">{b.problem.help}</legend>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {services.map((s, i) => {
            const on = serviceIds.includes(s.id);
            const price = repairPriceLabel(s, device?.repairs.find((r) => r.serviceId === s.id), currency);
            return (
              <li key={s.id}>
                <label className={cn("flex min-h-16 cursor-pointer items-center gap-3 rounded-input p-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary", selectable(on))}>
                  <input type="checkbox" checked={on} data-invalid={i === 0 && errors.serviceIds ? true : undefined} onChange={() => { touch(); setErrors((x) => ({ ...x, serviceIds: "" })); setServiceIds((ids) => (on ? ids.filter((x) => x !== s.id) : [...ids, s.id])); }} className="sr-only" />
                  <span className="flex size-6 shrink-0 items-center justify-center">{on ? <Check size={24} strokeWidth={1.75} aria-hidden /> : <ServiceIcon name={s.icon} size={24} className="text-steel" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] leading-5 font-medium">{s.title}</span>
                    <span className="num block">{priceText(price)}</span>
                  </span>
                </label>
              </li>
            );
          })}
          <li>
            <label className={cn("flex min-h-16 cursor-pointer items-center gap-3 rounded-input p-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary", selectable(somethingElse))}>
              <input type="checkbox" checked={somethingElse} onChange={() => { touch(); setSomethingElse((v) => !v); }} className="sr-only" />
              <span className="flex size-6 shrink-0 items-center justify-center">{somethingElse ? <Check size={24} strokeWidth={1.75} aria-hidden /> : <ServiceIcon size={24} className="text-steel" />}</span>
              <span className="text-[15px] leading-5 font-medium">{b.problem.somethingElse}</span>
            </label>
          </li>
        </ul>
        <FieldError id="err-services" msg={errors.serviceIds} />
      </fieldset>
      <div>
        <label htmlFor="issue" className={labelClass}>{b.problem.note}</label>
        <textarea id="issue" rows={3} maxLength={1000} value={issueNote} onChange={(ev) => { touch(); setIssueNote(ev.target.value); }} className={textareaClass} />
      </div>
      {uploadsEnabled && (
        <div>
          <p className={labelClass}>{b.problem.photos}</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {photos.map((p, i) => (
              <div key={p} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt={`Photo ${i + 1} of your device`} className="size-20 rounded-input border border-line object-cover" />
                <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos((x) => x.filter((y) => y !== p))} className="absolute -top-3 -right-3 flex size-11 items-center justify-center">
                  <span className="flex size-7 items-center justify-center rounded-full bg-night text-on-primary"><X size={16} strokeWidth={1.75} aria-hidden /></span>
                </button>
              </div>
            ))}
            {photos.length < 3 && (
              <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-input border border-dashed border-steel text-steel has-focus-visible:outline-2 has-focus-visible:outline-primary">
                {uploading ? <Loader2 size={24} strokeWidth={1.75} className="animate-spin" aria-hidden /> : <ImagePlus size={24} strokeWidth={1.75} aria-hidden />}
                <span className="sr-only">{b.problem.photos}</span>
                <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} aria-describedby="err-photos" onChange={(ev) => { void addPhotos(ev.target.files); ev.target.value = ""; }} />
              </label>
            )}
          </div>
          <FieldError id="err-photos" msg={errors.photos} />
        </div>
      )}
    </div>
  );

  const addressPart = () => (
    <>
      <div>
        <label htmlFor="area" className={labelClass}>{b.when.area}</label>
        <select id="area" value={address.area} onChange={(ev) => { setAddress((a) => ({ ...a, area: ev.target.value })); setErrors((x) => ({ ...x, "address.area": "" })); }} onBlur={() => blur("address.area")} aria-invalid={errors["address.area"] ? true : undefined} aria-describedby="err-area area-help" className={`${inputClass} h-12`}>
          <option value="" />
          {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
          <option value={OUTSIDE}>{b.when.areaOther}</option>
        </select>
        {outside ? (
          <p id="area-help" aria-live="polite" className="mt-1.5 text-sm leading-5">
            {fill(b.when.outside, { phone })} <a href={telLink(phone)} className="font-medium text-primary underline underline-offset-4">{fill(copy.emergency.call, { phone })}</a>
          </p>
        ) : (
          <p id="area-help" className="mt-1.5 text-sm leading-5 text-ink-soft">{fill(b.when.weVisit, { areas: areas.map((a) => a.name).join(", ") })}</p>
        )}
        {!outside && <FieldError id="err-area" msg={errors["address.area"]} />}
      </div>
      <div>
        <label htmlFor="line" className={labelClass}>{b.when.address}</label>
        <input id="line" autoComplete="street-address" value={address.line} onChange={(ev) => setAddress((a) => ({ ...a, line: ev.target.value }))} onBlur={() => blur("address.line")} aria-invalid={errors["address.line"] ? true : undefined} aria-describedby="err-line" className={`${inputClass} h-12`} maxLength={200} />
        <FieldError id="err-line" msg={errors["address.line"]} />
      </div>
      <div>
        <label htmlFor="map" className={labelClass}>{b.when.mapPin}</label>
        <input id="map" type="url" inputMode="url" value={address.mapLink} onChange={(ev) => setAddress((a) => ({ ...a, mapLink: ev.target.value }))} className={`${inputClass} h-12`} maxLength={500} />
      </div>
    </>
  );

  const placePart = () => (
    <div className="grid gap-5">
      <h2>{b.when.title}</h2>
      {slotDays.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-5">{fill(b.when.noSlots, { phone })}</p>
      ) : (
        <>
          <fieldset aria-describedby="err-date">
            <legend className={labelClass}>{b.when.date}</legend>
            <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-2">
              {slotDays.map((d, i) => {
                const [wd, dm] = formatLocalDate(d.date).split(",");
                return (
                  <button key={d.date} type="button" aria-pressed={d.date === date} data-invalid={i === 0 && errors["preferredSlot.date"] ? true : undefined} onClick={() => { touch(); setDate(d.date); setWindow(""); }} className={cn("flex min-h-16 min-w-20 shrink-0 flex-col items-center justify-center rounded-input px-3", selectable(d.date === date))}>
                    <span className="text-sm leading-5 font-medium">{wd}</span>
                    <span className="num">{dm?.trim()}</span>
                  </button>
                );
              })}
            </div>
            <FieldError id="err-date" msg={errors["preferredSlot.date"]} />
          </fieldset>
          {day && (
            <fieldset aria-describedby="err-window">
              <legend className={labelClass}>{b.when.window}</legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {day.windows.map((w, i) => (
                  <button key={w.window} type="button" disabled={!w.available} aria-pressed={w.window === window_} data-invalid={i === 0 && errors["preferredSlot.window"] ? true : undefined} onClick={() => { setWindow(w.window); setErrors((x) => ({ ...x, "preferredSlot.window": "" })); }} className={cn("num flex min-h-12 flex-col items-center justify-center rounded-input disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-soft", selectable(w.window === window_))}>
                    {formatWindow(w.window)}
                    {!w.available && <span className="text-xs font-normal">{b.when.full}</span>}
                  </button>
                ))}
              </div>
              <FieldError id="err-window" msg={errors["preferredSlot.window"]} />
            </fieldset>
          )}
        </>
      )}
      {addressPart()}
    </div>
  );

  const contactFields = (withEmail: boolean) => (
    <>
      <div>
        <label htmlFor="name" className={labelClass}>{b.contact.name}</label>
        <input id="name" autoComplete="name" value={customer.name} onChange={(ev) => setCustomer((c) => ({ ...c, name: ev.target.value }))} onBlur={() => blur("customer.name")} aria-invalid={errors["customer.name"] ? true : undefined} aria-describedby="err-name" className={`${inputClass} h-12`} maxLength={80} />
        <FieldError id="err-name" msg={errors["customer.name"]} />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>{b.contact.phone}</label>
        <input id="phone" type="tel" autoComplete="tel" inputMode="tel" value={customer.phone} onChange={(ev) => setCustomer((c) => ({ ...c, phone: ev.target.value }))} onBlur={() => blur("customer.phone")} aria-invalid={errors["customer.phone"] ? true : undefined} aria-describedby="err-phone phone-help" className={`${inputClass} num h-12`} maxLength={20} />
        <p id="phone-help" className="mt-1.5 text-sm leading-5 text-ink-soft">{b.contact.phoneHelp}</p>
        <FieldError id="err-phone" msg={errors["customer.phone"]} />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3">
        <input type="checkbox" checked={customer.whatsapp} onChange={(ev) => setCustomer((c) => ({ ...c, whatsapp: ev.target.checked }))} className="size-5 accent-primary" />
        <span className="text-[15px] leading-5 font-medium">{b.contact.whatsapp}</span>
      </label>
      {withEmail && (
        <div>
          <label htmlFor="email" className={labelClass}>{b.contact.email}</label>
          <input id="email" type="email" autoComplete="email" value={customer.email} onChange={(ev) => setCustomer((c) => ({ ...c, email: ev.target.value }))} onBlur={() => blur("customer.email")} aria-invalid={errors["customer.email"] ? true : undefined} aria-describedby="err-email" className={`${inputClass} h-12`} maxLength={200} />
          <FieldError id="err-email" msg={errors["customer.email"]} />
        </div>
      )}
      <div aria-hidden className="absolute -left-[9999px] size-0 overflow-hidden">
        <label>Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(ev) => setWebsite(ev.target.value)} /></label>
      </div>
      <Turnstile siteKey={turnstileSiteKey} onToken={setToken} />
    </>
  );

  const views: Record<StepId, () => React.ReactNode> = {
    device: devicePart,
    problem: problemPart,
    place: placePart,
    contact: () => (
      <div className="grid gap-5">
        <h2>{b.contact.title}</h2>
        {contactFields(true)}
      </div>
    ),
    what: () => (
      <div className="grid gap-10">
        {devicePart()}
        {problemPart()}
      </div>
    ),
    where: () => (
      <div className="grid gap-5">
        <h2>{b.contact.title}</h2>
        {addressPart()}
        {contactFields(false)}
      </div>
    ),
  };

  const priceLine = fill(b.summary.estimate, { price: estimate ?? b.summary.afterCheck });
  const feeLine = mode === "emergency" && emergencyFee ? fill(copy.emergency.open, { responseMinutes, fee: formatMoney(emergencyFee, currency) }) : mode === "emergency" && responseMinutes ? fill(copy.emergency.openNoFee, { responseMinutes }) : null;
  const areaName = areas.find((a) => a.slug === address.area)?.name;
  const summaryRows: [string, string | undefined][] = [
    [b.progress[0], deviceLabel || undefined],
    [b.progress[1], [...picked.map((s) => s.title), somethingElse ? b.problem.somethingElse : null].filter(Boolean).join(", ") || undefined],
    ...(mode === "standard" ? ([[b.progress[2], [date && window_ ? `${formatLocalDate(date)}, ${formatWindow(window_)}` : null, areaName].filter(Boolean).join(" · ") || undefined]] as [string, string | undefined][]) : []),
  ];

  const summary = (
    <>
      <p className="text-lg font-semibold">{b.summary.title}</p>
      <dl className="mt-4 grid gap-3">
        {summaryRows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-sm leading-5 text-on-primary/80">{k}</dt>
            <dd className="text-[15px] leading-5 font-medium">{v ?? "–"}</dd>
          </div>
        ))}
      </dl>
      <p className="num mt-5 border-t border-on-primary/20 pt-4">{priceLine}</p>
      {feeLine && <p className="mt-2 text-sm leading-5 text-on-primary/80">{feeLine}</p>}
      <p className="mt-2 text-sm leading-5 text-on-primary/80">{copy.service.priceNote}</p>
    </>
  );

  return (
    <div ref={topRef} data-booking className="grid scroll-mt-24 gap-8 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        <div className="mb-8" role="group" aria-label={`Step ${step + 1} of ${steps.length}`}>
          <div className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full origin-left rounded-full bg-primary transition-transform duration-[var(--dur-medium)] ease-out" style={{ transform: `scaleX(${(step + 1) / steps.length})` }} />
          </div>
          {mode === "standard" && (
            <ol className="mt-3 grid grid-cols-4 gap-2">
              {b.progress.map((label, i) => (
                <li key={label}>
                  <button type="button" disabled={i >= step} onClick={() => go(i)} aria-current={i === step ? "step" : undefined} className={cn("min-h-11 w-full text-left text-xs leading-4 sm:text-sm sm:leading-5", i === step ? "font-medium text-ink" : "text-ink-soft", i < step && "underline-offset-4 hover:underline")}>
                    {label}
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <form
          noValidate
          onSubmit={(ev) => {
            ev.preventDefault();
            if (last) void submit();
            else next();
          }}
        >
          <div className="overflow-x-clip">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
              <m.div
                key={steps[step]}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 24 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -24 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: dur.medium, ease: ease.out }}
              >
                {views[steps[step]]()}
              </m.div>
            </AnimatePresence>
          </div>

          {last && <div className="mt-8 rounded-card bg-night p-5 text-on-primary lg:hidden">{summary}</div>}

          <p role="alert" className={formError ? "mt-6 rounded-input border border-emergency p-4 text-[15px] leading-6 text-emergency" : "sr-only"}>{formError}</p>

          {/* Mobile: bottom summary bar. Desktop: buttons under the step. */}
          <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center gap-3 border-t border-line bg-bg px-4 py-3 sm:static sm:mx-0 sm:border-0 sm:p-0" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
            {step > 0 && (
              <Button type="button" variant="outline" size="lg" onClick={() => go(step - 1)}>{b.summary.back}</Button>
            )}
            <span className="num min-w-0 flex-1 truncate lg:hidden">{step > 0 || estimate ? (estimate ?? b.summary.afterCheck) : ""}</span>
            <Button type="submit" size="lg" variant={mode === "emergency" && last ? "emergency" : "primary"} disabled={submitting || uploading || (last && slotDays.length === 0 && mode === "standard")} className="ml-auto">
              {submitting ? b.summary.sending : last ? (mode === "emergency" ? copy.emergency.request : b.summary.confirm) : b.summary.next}
            </Button>
          </div>
        </form>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-card bg-night p-6 text-on-primary">{summary}</div>
      </aside>
    </div>
  );
}
