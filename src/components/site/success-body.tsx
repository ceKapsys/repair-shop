"use client";

import { useEffect, useState } from "react";
import { copy, fill } from "@/content/copy";

/**
 * "Booking {bookingNo}. We'll call {phone} to confirm your time."
 * The customer's phone is read from this tab's sessionStorage (never put in the URL).
 */
export function SuccessBody({ bookingNo }: { bookingNo: string }) {
  const [phone, setPhone] = useState<string>();
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem("booking:done") ?? "null") as { bookingNo?: string; phone?: string } | null;
      if (saved?.bookingNo === bookingNo && saved.phone) setPhone(saved.phone);
    } catch {}
  }, [bookingNo]);
  const c = copy.booking.success;
  return <>{phone ? fill(c.body, { bookingNo, phone }) : fill(c.bodyNoPhone, { bookingNo })}</>;
}
