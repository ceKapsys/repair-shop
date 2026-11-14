import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { getSettings } from "@/lib/settings";
import { siteDefaults } from "@/lib/site";
import "./globals.css";

/** Sets .dark / .light before paint: the saved choice, else the system setting. Without JS, CSS follows the system. */
const themeScript = `try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.add(t)}catch(e){}`;

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

export const viewport: Viewport = { colorScheme: "light dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
