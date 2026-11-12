"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { NumberInput, SelectInput, SlugInput, TextInput, Toggle, useEntityForm, useForm } from "@/components/admin/form";
import { ImageUrlInput } from "@/components/admin/image-input";
import { SeoPanel } from "@/components/admin/seo-panel";
import { inputClass, Switch } from "@/components/ui/field";
import { priceLabel } from "@/lib/format";
import type { BrandT, DeviceRepairT, DeviceT, ServiceT } from "@/lib/types";
import { deviceInput } from "@/lib/validation/admin";
import { saveDoc } from "../../../actions";

/** Per-model price matrix: tick the repairs this model supports and set its own price. */
function RepairMatrix({ services, currency }: { services: ServiceT[]; currency: string }) {
  const f = useForm();
  const repairs = (f.get("repairs") ?? []) as DeviceRepairT[];
  const byId = new Map(repairs.map((r) => [r.serviceId, r]));
  const update = (serviceId: string, patch: Partial<DeviceRepairT> | null) => {
    const has = byId.has(serviceId);
    if (patch === null) return f.set("repairs", repairs.filter((r) => r.serviceId !== serviceId));
    if (!has) return f.set("repairs", [...repairs, { serviceId, showPrice: true, ...patch }]);
    f.set("repairs", repairs.map((r) => (r.serviceId === serviceId ? { ...r, ...patch } : r)));
  };
  if (!services.length) return <p className="text-sm text-muted">Create services first, then set prices per model here.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th className="py-2 pr-3 font-medium">Repair</th>
            <th className="py-2 pr-3 font-medium">Price for this model</th>
            <th className="py-2 pr-3 font-medium">Time</th>
            <th className="py-2 font-medium">Show price</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => {
            const r = byId.get(s._id);
            return (
              <tr key={s._id} className="border-b border-border last:border-0">
                <td className="py-2 pr-3">
                  <label className="flex min-h-11 items-center gap-3">
                    <input type="checkbox" checked={Boolean(r)} onChange={(e) => update(s._id, e.target.checked ? {} : null)} className="size-4 accent-[var(--primary)]" />
                    <span>
                      {s.title}
                      <span className="block text-xs text-muted">Default: {priceLabel(s, currency) ?? "quote"}</span>
                    </span>
                  </label>
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    disabled={!r}
                    aria-label={`${s.title} price`}
                    placeholder={s.priceMin != null ? String(s.priceMin) : "—"}
                    value={r?.price ?? ""}
                    onChange={(e) => update(s._id, { price: e.target.value === "" ? undefined : Number(e.target.value) })}
                    className={`${inputClass} mt-0 w-32`}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input disabled={!r} aria-label={`${s.title} time`} placeholder={s.duration ?? "—"} value={r?.duration ?? ""} onChange={(e) => update(s._id, { duration: e.target.value })} className={`${inputClass} mt-0 w-36`} />
                </td>
                <td className="py-2">
                  {r && <Switch id={`show-${s._id}`} label={<span className="sr-only">Show price</span>} checked={r.showPrice} onChange={(v) => update(s._id, { showPrice: v })} />}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SpecsEditor() {
  const f = useForm();
  const specs = Object.entries((f.get("specs") ?? {}) as Record<string, string>);
  const write = (rows: [string, string][]) => f.set("specs", Object.fromEntries(rows.filter(([k]) => k !== "" || true)));
  return (
    <div className="space-y-2">
      {specs.map(([k, v], i) => (
        <div key={i} className="flex gap-2">
          <input aria-label="Spec name" value={k} placeholder="Screen" onChange={(e) => write(specs.map((s, j) => (j === i ? [e.target.value, s[1]] : s)))} className={`${inputClass} mt-0`} />
          <input aria-label="Spec value" value={v} placeholder="6.1-inch OLED" onChange={(e) => write(specs.map((s, j) => (j === i ? [s[0], e.target.value] : s)))} className={`${inputClass} mt-0`} />
          <button type="button" onClick={() => write(specs.filter((_, j) => j !== i))} className="min-h-11 shrink-0 px-2 text-sm text-emergency">Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => write([...specs, [`Spec ${specs.length + 1}`, ""]])} className="min-h-11 text-sm font-medium text-primary">+ Add spec</button>
    </div>
  );
}

export function DeviceEditor({
  device, defaultBrand, brands, services, siteUrl, titleTemplate, currency,
}: {
  device: DeviceT | null; defaultBrand?: string; brands: BrandT[]; services: ServiceT[]; siteUrl: string; titleTemplate: string; currency: string;
}) {
  const router = useRouter();
  const form = useEntityForm({
    initial: device ?? { brandId: defaultBrand ?? brands[0]?._id ?? "", model: "", slug: "", image: "", releaseYear: undefined, specs: {}, repairs: [], isActive: true, seo: { keywords: [] } },
    isNew: !device,
    schema: deviceInput,
    save: (v) => saveDoc("device", device?._id ?? null, v),
    onSaved: (r) => (device ? router.refresh() : router.replace(`/admin/devices/model/${r.id}`)),
  });
  const brand = brands.find((b) => b._id === form.values.brandId);
  const path = `/devices/${brand?.slug ?? "brand"}/${form.values.slug}`;
  return (
    <EditorShell
      form={form}
      title={device ? `${brand?.name ?? ""} ${form.values.model}` : "New model"}
      backHref="/admin/devices"
      viewHref={path}
      actions={device && <DeleteButton kind="device" id={device._id} label={device.model} redirectTo="/admin/devices" compact />}
      tabs={[
        {
          id: "content",
          label: "Details",
          content: (
            <div className="space-y-6">
              <Section>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectInput name="brandId" label="Brand" options={brands.map((b) => ({ value: b._id, label: b.name }))} />
                  <TextInput name="model" label="Model name" placeholder="iPhone 13" autoFocus={!device} />
                </div>
                <SlugInput source="model" prefix={`/devices/${brand?.slug ?? ""}/`} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <NumberInput name="releaseYear" label="Release year" step="1" />
                  <Toggle name="isActive" label="Live on website" className="sm:pt-7" />
                </div>
                <ImageUrlInput name="image" label="Model image" folder="devices" />
              </Section>
              <Section title="Repairs and prices" description="Leave the price empty to use the service’s default price.">
                <RepairMatrix services={services} currency={currency} />
              </Section>
              <Section title="Specs" description="Optional details shown on the model page.">
                <SpecsEditor />
              </Section>
            </div>
          ),
        },
        { id: "seo", label: "SEO", content: <SeoPanel path={path} titleField="model" siteUrl={siteUrl} titleTemplate={titleTemplate} /> },
      ]}
    />
  );
}
