import { Heading, Text } from "react-email";
import { colors, EmailLayout } from "./layout";

const copy: Record<string, string> = {
  confirmed: "Your repair visit is confirmed.",
  "on-the-way": "Your technician is on the way.",
  "in-progress": "Your repair is in progress.",
  done: "Your repair is complete. Thank you for choosing us!",
  cancelled: "Your booking has been cancelled. If this is unexpected, please call us.",
};

export function StatusUpdateEmail(d: { shopName: string; name: string; bookingNo: string; status: string; phone: string; note?: string }) {
  return (
    <EmailLayout shopName={d.shopName} preview={`${d.bookingNo}: ${copy[d.status] ?? d.status}`}>
      <Heading as="h1" style={{ fontSize: 20, margin: "12px 0 8px" }}>Hi {d.name.split(" ")[0]},</Heading>
      <Text>{copy[d.status] ?? `Your booking status is now: ${d.status}.`}</Text>
      {d.note && <Text>{d.note}</Text>}
      <Text style={{ fontSize: 13, color: colors.muted }}>Booking {d.bookingNo} · Questions? Call {d.phone}.</Text>
    </EmailLayout>
  );
}
