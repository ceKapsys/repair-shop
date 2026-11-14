import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";

/** Email clients ignore CSS variables, so the Sapphire Nightfall light values are repeated here (the one exception to tokens-only). */
export const colors = { primary: "#0474C4", emergency: "#B42318", text: "#262B40", muted: "#2C444C", border: "#E8F0FB", surface: "#F5F8FD", night: "#262B40", white: "#FFFFFF" };

export function EmailLayout({ preview, shopName, children }: { preview: string; shopName: string; children: React.ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.surface, fontFamily: "Geist, Arial, sans-serif", color: colors.text, margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "24px auto", backgroundColor: colors.white, borderRadius: 14, border: `1px solid ${colors.border}` }}>
          <Section style={{ padding: "20px 24px 0" }}>
            <Text style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{shopName}</Text>
          </Section>
          <Section style={{ padding: "8px 24px 24px" }}>{children}</Section>
          <Hr style={{ borderColor: colors.border, margin: 0 }} />
          <Section style={{ padding: "12px 24px" }}>
            <Text style={{ fontSize: 12, color: colors.muted, margin: 0 }}>{shopName}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <Text style={{ fontSize: 14, margin: "4px 0", lineHeight: "20px" }}>
      <span style={{ color: colors.muted }}>{label}: </span>
      {value}
    </Text>
  );
}
