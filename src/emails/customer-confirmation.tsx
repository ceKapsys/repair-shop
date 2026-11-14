import { Button, Text } from "react-email";
import { copy } from "@/content/copy";
import { colors, EmailLayout, Row } from "./layout";
import type { BookingEmailData } from "./admin-alert";

/** Customer confirmation. `body` is the locked sentence from the copy deck, already filled in. */
export function CustomerConfirmationEmail(d: BookingEmailData & { whatsappUrl: string; body: string }) {
  return (
    <EmailLayout shopName={d.shopName} preview={d.body}>
      <Text style={{ fontSize: 16, lineHeight: "26px", margin: "12px 0 16px" }}>{d.body}</Text>
      <Row label="Booking" value={<strong>{d.bookingNo}</strong>} />
      <Row label="Estimated price" value={d.estimate} />
      <Button href={d.whatsappUrl} style={{ background: colors.primary, color: colors.white, padding: "12px 18px", borderRadius: 10, fontWeight: 600, marginTop: 16 }}>
        {copy.whatsapp.label}
      </Button>
    </EmailLayout>
  );
}
