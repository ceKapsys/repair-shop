/** Google Maps embed from Settings. Accepts the embed URL or the whole <iframe> snippet; anything else is ignored. */
export function mapEmbedSrc(value?: string): string | null {
  if (!value) return null;
  const src = value.includes("<iframe") ? (value.match(/src=["']([^"']+)["']/)?.[1] ?? "") : value.trim();
  try {
    const u = new URL(src);
    const ok = u.protocol === "https:" && (u.hostname === "www.google.com" || u.hostname === "maps.google.com") && u.pathname.startsWith("/maps");
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

export function MapEmbed({ value, title }: { value?: string; title: string }) {
  const src = mapEmbedSrc(value);
  if (!src) return null;
  return <iframe src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="aspect-[4/3] w-full rounded-card border border-line md:aspect-[16/9]" />;
}
