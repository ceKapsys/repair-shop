"use client";

import { useEffect, useSyncExternalStore } from "react";

/** Page-aware WhatsApp message. Service and device pages set it; everywhere else the home message is used. */
let current: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useContactMessage(fallback: string) {
  return useSyncExternalStore(subscribe, () => current, () => null) ?? fallback;
}

/** Render on a page to set the floating WhatsApp button's prefilled message while that page is open. */
export function ContactMessage({ text }: { text: string }) {
  useEffect(() => {
    current = text;
    emit();
    return () => {
      current = null;
      emit();
    };
  }, [text]);
  return null;
}
