/** Rich text saved from the admin editor. HTML is sanitised with an allow-list on save (lib/sanitize.ts). */
export function RichHtml({ html, className = "" }: { html?: string; className?: string }) {
  if (!html || !html.replace(/<[^>]+>/g, "").trim()) return null;
  return <div className={`prose-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
