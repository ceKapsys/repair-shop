import { ChevronDown } from "lucide-react";
import { copy } from "@/content/copy";
import type { Faq } from "@/lib/types";
import { JsonLd } from "./json-ld";

/** Accordion of FAQs (native <details>, works without JS) plus FAQPage JSON-LD. */
export function FaqSection({ faqs, title = copy.home.faq.title, schema = true }: { faqs: Faq[]; title?: string; schema?: boolean }) {
  const items = faqs.filter((f) => f.question && f.answer);
  if (!items.length) return null;
  return (
    <section aria-labelledby="faq">
      {schema && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: items.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      )}
      <h2 id="faq">{title}</h2>
      <div className="mt-8 max-w-3xl divide-y divide-line rounded-card border border-line bg-bg">
        {items.map((f) => (
          <details key={f.question} className="group px-5">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
              {f.question}
              <ChevronDown size={18} className="shrink-0 text-steel transition-transform duration-200 group-open:rotate-180" aria-hidden />
            </summary>
            <p className="pb-4 whitespace-pre-line text-ink-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
