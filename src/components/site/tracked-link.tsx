"use client";

import { track } from "@/lib/analytics";

/** An <a> that fires a GA4 event on click (call and WhatsApp links outside the floating buttons). */
export function TrackedLink({ event, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { event: "whatsapp_click" | "call_click" }) {
  return (
    <a {...props} onClick={() => track(event, { path: typeof window !== "undefined" ? window.location.pathname : undefined })}>
      {children}
    </a>
  );
}
