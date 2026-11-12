import { ContactFab } from "@/components/site/contact-fab";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <SiteHeader shopName={s.shopName} />
      <main id="main">{children}</main>
      <SiteFooter s={s} />
      <ContactFab whatsapp={s.contacts.whatsapp} phone={s.contacts.phones[0]} message={s.contacts.whatsappMessage} />
    </>
  );
}
