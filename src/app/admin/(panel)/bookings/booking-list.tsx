"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import { ContactButtons } from "@/components/admin/contact-buttons";
import { formatMoney } from "@/lib/format";
import type { BookingStatus, BookingT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { setBookingStatus } from "./actions";
import { EmergencyBadge, STATUS_TEXT, StatusBadge, whenLabel } from "./status-badge";

function StatusSelect({ b }: { b: BookingT }) {
  const [status, setStatus] = useOptimistic(b.status);
  const [, start] = useTransition();
  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Status for {b.bookingNo}</span>
      <StatusBadge status={status} />
      <select
        value={status}
        onChange={(e) => {
          const v = e.target.value as BookingStatus;
          start(async () => {
            setStatus(v);
            const r = await setBookingStatus(b._id, v);
            if (!r.ok) toast.error(r.error);
            else toast.success(`${b.bookingNo}: ${STATUS_TEXT[v]}`);
          });
        }}
        className="h-11 rounded-input border border-line bg-bg px-2 text-sm"
      >
        {(Object.keys(STATUS_TEXT) as BookingStatus[]).map((s) => <option key={s} value={s}>{STATUS_TEXT[s]}</option>)}
      </select>
    </label>
  );
}

export function BookingList({ bookings, currency, shopName }: { bookings: BookingT[]; currency: string; shopName: string }) {
  // Emergencies that still need action are pinned on top.
  const urgent = (b: BookingT) => b.type === "emergency" && !["done", "cancelled"].includes(b.status);
  const rows = [...bookings].sort((a, b) => Number(urgent(b)) - Number(urgent(a)));
  if (!rows.length) return null;
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
      {rows.map((b) => (
        <li key={b._id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3", urgent(b) && "border-l-4 border-l-emergency bg-emergency/5")}>
          <Link href={`/admin/bookings/${b._id}`} className="min-w-0 flex-1 basis-64 hover:text-primary">
            <span className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{b.customer.name}</span>
              <span className="text-xs text-ink-soft tabular-nums">{b.bookingNo}</span>
              {b.type === "emergency" && <EmergencyBadge />}
            </span>
            <span className="block truncate text-sm text-ink-soft">
              {b.deviceLabel || b.customDevice || "Device not given"} · {b.serviceLabels?.join(", ") || "Diagnosis"}
              {b.quotedPrice != null ? ` · quoted ${formatMoney(b.quotedPrice, currency)}` : b.estimate ? ` · est. ${b.estimate}` : ""}
            </span>
            <span className="flex flex-wrap gap-x-3 text-sm text-ink-soft">
              <span className="text-ink">{whenLabel(b)}</span>
              {b.address.area && <span className="flex items-center gap-1"><MapPin size={13} aria-hidden /> {b.address.area}</span>}
            </span>
          </Link>
          <ContactButtons phone={b.customer.phone} whatsapp={b.customer.whatsapp} name={b.customer.name} bookingNo={b.bookingNo} shopName={shopName} />
          <StatusSelect key={b.status} b={b} />
        </li>
      ))}
    </ul>
  );
}
