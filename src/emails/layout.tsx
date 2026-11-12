import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "react-email";

export const colors = { primary: "#0F766E", emergency: "#DC2626", text: "#0F172A", muted: "#475569", border: "#E2E8F0" };

export function EmailLayout({ preview, shopName, children }: { preview: string; shopName: string; children: React.ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: "#F8FAFC", fontFamily: "Inter, Arial, sans-serif", color: colors.text, margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "24px auto", backgroundColor: "#fff", borderRadius: 12, border: `1px solid ${colors.border}` }}>
          <Section style={{ padding: "20px 24px 0" }}>
            <Text style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>{shopName}</Text>
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
