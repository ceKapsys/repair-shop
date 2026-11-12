type GaEvent = "booking_start" | "booking_submit" | "emergency_submit" | "whatsapp_click" | "call_click";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire a GA4 event if gtag is loaded; no-op otherwise. */
export function track(event: GaEvent, params: Record<string, unknown> = {}) {
  if (typeof window !== "undefined") window.gtag?.("event", event, params);
}
