"use client";

import { MessageCircle, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { telLink, waLink } from "@/lib/links";
import { track } from "@/lib/analytics";

/** Floating WhatsApp + Call buttons, bottom-right in the thumb zone. */
export function ContactFab({ whatsapp, phone, message }: { whatsapp: string; phone: string; message: string }) {
  const path = usePathname();
  const text = path && path !== "/" ? `${message} (from ${path})` : message;
  const base =
    "pressable flex size-14 items-center justify-center rounded-full text-white shadow-3";
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3 md:right-6 md:bottom-6">
      <a
        href={waLink(whatsapp, text)}
        target="_blank"
        rel="noopener"
        aria-label="Chat on WhatsApp"
        onClick={() => track("whatsapp_click", { path })}
        className={`${base} bg-[#25D366]`}
      >
        <MessageCircle size={26} strokeWidth={1.75} aria-hidden />
      </a>
      <a
        href={telLink(phone)}
        aria-label={`Call ${phone}`}
        onClick={() => track("call_click", { path })}
        className={`${base} bg-primary text-primary-foreground`}
      >
        <Phone size={24} strokeWidth={1.75} aria-hidden />
      </a>
    </div>
  );
}
