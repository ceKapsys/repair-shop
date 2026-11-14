import { Siren } from "lucide-react";
import { Badge } from "@/components/ui/field";
import { formatDate } from "@/lib/format";
import { formatLocalDate, formatWindow } from "@/lib/time";
import type { BookingStatus, BookingT } from "@/lib/types";

const tone: Record<BookingStatus, "neutral" | "primary" | "success" | "warning" | "emergency"> = {
  new: "warning",
  confirmed: "primary",
  "on-the-way": "primary",
  "in-progress": "primary",
  done: "success",
  cancelled: "neutral",
};
export const STATUS_TEXT: Record<BookingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  "on-the-way": "On the way",
  "in-progress": "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return <Badge tone={tone[status]}>{STATUS_TEXT[status]}</Badge>;
}

export function EmergencyBadge() {
  return <Badge tone="emergency"><Siren size={12} aria-hidden /> Emergency</Badge>;
}

export function whenLabel(b: Pick<BookingT, "type" | "createdAt" | "preferredSlot">) {
  if (b.type === "emergency") return `ASAP · requested ${formatDate(b.createdAt, { dateStyle: "medium", timeStyle: "short" })}`;
  return b.preferredSlot?.date ? `${formatLocalDate(b.preferredSlot.date)}${b.preferredSlot.window ? `, ${formatWindow(b.preferredSlot.window)}` : ""}` : "—";
}
