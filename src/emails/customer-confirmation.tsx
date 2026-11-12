import { Button, Heading, Text } from "react-email";
import { colors, EmailLayout, Row } from "./layout";
import type { BookingEmailData } from "./admin-alert";

export function CustomerConfirmationEmail(d: BookingEmailData & { whatsappUrl: string; phone: string; responseMinutes?: number }) {
  const emergency = d.type === "emergency";
  return (
    <EmailLayout shopName={d.shopName} preview={`We’ve got your booking ${d.bookingNo}`}>
      <Heading as="h1" style={{ fontSize: 20, margin: "12px 0 8px" }}>Thanks, {d.customer.name.split(" ")[0]} — we’ve got it.</Heading>
      <Text style={{ margin: "0 0 12px", color: colors.muted }}>
        {emergency
          ? `A technician will call you${d.responseMinutes ? ` within ${d.responseMinutes} minutes` : " shortly"}.`
          : "We’ll confirm your visit shortly. Your booking number is below."}
      </Text>
      <Row label="Booking number" value={<strong>{d.bookingNo}</strong>} />
      <Row label="Device" value={d.device} />
      <Row label="Repair" value={d.services.join(", ")} />
      <Row label="When" value={d.slot} />
      <Row label="Address" value={[d.address.line, d.address.area].filter(Boolean).join(", ")} />
      <Row label="Estimate" value={d.estimate} />
      <Button href={d.whatsappUrl} style={{ background: "#25D366", color: "#fff", padding: "10px 16px", borderRadius: 10, fontWeight: 600, marginTop: 16 }}>
        Message us on WhatsApp
      </Button>
      <Text style={{ fontSize: 13, color: colors.muted, marginTop: 16 }}>Need to change something? Call {d.phone} and quote {d.bookingNo}.</Text>
    </EmailLayout>
  );
}
