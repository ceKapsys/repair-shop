import Script from "next/script";
import { ContactFab } from "@/components/site/contact-fab";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { MotionProvider } from "@/components/site/motion";
import { copy, fill } from "@/content/copy";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const gaId = s.analytics.ga4Id;
  return (
    <MotionProvider>
      <a href="#main" className="sr-only z-50 rounded-input bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        {copy.nav.skip}
      </a>
      <SiteHeader s={s} />
      <main id="main">{children}</main>
      <SiteFooter s={s} />
      <ContactFab whatsapp={s.contacts.whatsapp} phone={s.contacts.phones[0]} message={fill(copy.whatsapp.home, { shop: s.shopName })} />
      {gaId && /^G-[A-Z0-9]+$/.test(gaId) && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
          <Script id="ga4" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag("js",new Date());gtag("config","${gaId}");`}
          </Script>
        </>
      )}
    </MotionProvider>
  );
}
