import { MessageCircle, Phone } from "lucide-react";
import { telLink, waLink } from "@/lib/links";

/** One-tap call / WhatsApp for a customer, sized for thumbs. */
export function ContactButtons({ phone, whatsapp, name, bookingNo, shopName }: { phone: string; whatsapp?: boolean; name: string; bookingNo: string; shopName: string }) {
  return (
    <div className="flex gap-1">
      <a href={telLink(phone)} aria-label={`Call ${name}`} className="flex size-11 items-center justify-center rounded-lg text-primary hover:bg-primary/10">
        <Phone size={18} strokeWidth={1.75} />
      </a>
      {whatsapp !== false && (
        <a
          href={waLink(phone, `Hi ${name.split(" ")[0]}, this is ${shopName} about your booking ${bookingNo}.`)}
          target="_blank"
          rel="noopener"
          aria-label={`WhatsApp ${name}`}
          className="flex size-11 items-center justify-center rounded-lg text-success hover:bg-surface"
        >
          <MessageCircle size={18} strokeWidth={1.75} />
        </a>
      )}
    </div>
  );
}
