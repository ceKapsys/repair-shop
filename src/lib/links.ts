export function waLink(target: string, text?: string) {
  if (!target) return "https://wa.me/message/6MOOTRK5QAJOD1";
  if (target.startsWith("http://") || target.startsWith("https://")) {
    return target;
  }
  if (target.includes("message/")) {
    return `https://wa.me/message/${target.replace(/^.*message\//, "")}`;
  }
  if (/^[A-Za-z0-9]{10,}$/.test(target.trim())) {
    return `https://wa.me/message/${target.trim()}`;
  }
  const digits = target.replace(/\D/g, "");
  return text
    ? `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
    : `https://wa.me/${digits}`;
}

export function telLink(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
