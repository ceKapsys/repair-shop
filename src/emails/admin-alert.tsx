import { Button, Heading, Img, Link, Section, Text } from "react-email";
import { colors, EmailLayout, Row } from "./layout";

export type BookingEmailData = {
  shopName: string;
  bookingNo: string;
  type: "standard" | "emergency";
  customer: { name: string; phone: string; whatsapp: boolean; email?: string };
  address: { line?: string; area?: string; city?: string; mapLink?: string };
  device: string;
  services: string[];
  issueNote?: string;
  slot?: string;
  estimate?: string;
  photos: string[];
  adminUrl: string;
};

const digits = (p: string) => p.replace(/[^\d+]/g, "");

export function AdminAlertEmail(d: BookingEmailData) {
  const emergency = d.type === "emergency";
  const mapLink =
    d.address.mapLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([d.address.line, d.address.area, d.address.city].filter(Boolean).join(", "))}`;
  return (
    <EmailLayout shopName={d.shopName} preview={`${emergency ? "EMERGENCY " : ""}${d.bookingNo}: ${d.device}`}>
      {emergency && (
        <Text style={{ background: colors.emergency, color: colors.white, borderRadius: 8, padding: "6px 10px", fontWeight: 600, fontSize: 13, display: "inline-block" }}>
          Emergency: call the customer now
        </Text>
      )}
      <Heading as="h1" style={{ fontSize: 20, margin: "12px 0 4px" }}>
        {emergency ? "Emergency booking" : "New booking"} {d.bookingNo}
      </Heading>
      <Text style={{ color: colors.muted, margin: "0 0 12px" }}>
        {d.device} · {d.services.join(", ") || "Problem described in the notes"}
      </Text>
      <Section style={{ margin: "8px 0 16px" }}>
        <Button href={`tel:${digits(d.customer.phone)}`} style={{ background: colors.primary, color: colors.white, padding: "10px 16px", borderRadius: 10, fontWeight: 600, marginRight: 8 }}>
          Call {d.customer.name}
        </Button>
        <Button href={`https://wa.me/${d.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${d.customer.name}, this is ${d.shopName} about booking ${d.bookingNo}.`)}`} style={{ background: colors.night, color: colors.white, padding: "10px 16px", borderRadius: 10, fontWeight: 600 }}>
          WhatsApp
        </Button>
      </Section>
      <Row label="Customer" value={`${d.customer.name} · ${d.customer.phone}${d.customer.email ? ` · ${d.customer.email}` : ""}`} />
      <Row label="Address" value={<Link href={mapLink}>{[d.address.line, d.address.area, d.address.city].filter(Boolean).join(", ")}</Link>} />
      <Row label="When" value={d.slot} />
      <Row label="Estimate" value={d.estimate} />
      <Row label="Notes" value={d.issueNote} />
      {d.photos.length > 0 && (
        <Section style={{ marginTop: 12 }}>
          {d.photos.map((p) => (
            <Link key={p} href={p}><Img src={p} width="120" alt="Customer photo" style={{ borderRadius: 8, display: "inline-block", marginRight: 8 }} /></Link>
          ))}
        </Section>
      )}
      <Text style={{ marginTop: 16 }}>
        <Link href={d.adminUrl}>Open in admin</Link>
      </Text>
    </EmailLayout>
  );
}
