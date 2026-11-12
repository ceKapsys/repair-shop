export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export function telLink(number: string) {
  return `tel:${number.replace(/[^\d+]/g, "")}`;
}
