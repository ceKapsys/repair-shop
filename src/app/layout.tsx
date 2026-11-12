import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(siteDefaults.url),
    title: { default: s.shopName, template: s.seoDefaults.titleTemplate },
    description: s.seoDefaults.description,
    verification: s.analytics.searchConsoleVerification ? { google: s.analytics.searchConsoleVerification } : undefined,
    icons: s.branding.favicon ? { icon: s.branding.favicon } : undefined,
    applicationName: s.shopName,
    openGraph: { siteName: s.shopName, type: "website" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  // Admin brand colour re-themes the light palette without a code change.
  const brandCss =
    s.branding.primaryColor.toLowerCase() !== siteDefaults.primaryColor.toLowerCase() &&
    /^#[0-9a-f]{6}$/i.test(s.branding.primaryColor)
      ? `@media (prefers-color-scheme: light){:root{--primary:${s.branding.primaryColor}}}`
      : null;

  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <head>{brandCss && <style>{brandCss}</style>}</head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
