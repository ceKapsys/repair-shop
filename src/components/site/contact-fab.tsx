"use client";

import { MessageCircle, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { copy, fill } from "@/content/copy";
import { track } from "@/lib/analytics";
import { telLink, waLink } from "@/lib/links";
import { useContactMessage } from "./contact-message";

/** Floating WhatsApp + Call buttons: bottom-right, safe-area aware, static at rest. */
export function ContactFab({ whatsapp, phone, message }: { whatsapp: string; phone: string; message: string }) {
  const path = usePathname();
  const text = useContactMessage(message);
  // The booking form has its own bottom bar on phones, so the floating buttons would cover it.
  const inForm = path?.startsWith("/book") || path?.startsWith("/emergency");
  const base = "pressable flex size-14 items-center justify-center rounded-full border border-line shadow-card";
  return (
    <div
      className={`fixed right-4 z-40 flex flex-col gap-2 md:right-6 ${inForm ? "max-md:hidden" : ""}`}
      style={{ bottom: "calc(16px + env(safe-area-inset-bottom))" }}
    >
      <a
        href={waLink(whatsapp, text)}
        target="_blank"
        rel="noopener"
        aria-label={copy.whatsapp.label}
        onClick={() => track("whatsapp_click", { path })}
        className={`${base} bg-bg text-ink`}
      >
        <MessageCircle size={24} strokeWidth={1.75} aria-hidden />
      </a>
      <a
        href={telLink(phone)}
        aria-label={fill(copy.whatsapp.callLabel, { phone })}
        onClick={() => track("call_click", { path })}
        className={`${base} bg-night text-on-primary`}
      >
        <Phone size={24} strokeWidth={1.75} aria-hidden />
      </a>
    </div>
  );
}
