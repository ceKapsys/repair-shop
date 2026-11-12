import "server-only";
import sanitizeHtml from "sanitize-html";

/** Allow-list for rich text produced by the Tiptap editor. */
export function cleanHtml(html = "") {
  return sanitizeHtml(html, {
    allowedTags: [
      "h2", "h3", "h4", "p", "br", "hr", "strong", "em", "u", "s", "code", "pre", "blockquote",
      "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "aside", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "title"],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      aside: ["data-callout", "class"],
      div: ["data-callout", "class"],
      "*": [],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: (tag, attribs) => {
        const external = /^https?:\/\//.test(attribs.href ?? "");
        return { tagName: "a", attribs: external ? { ...attribs, rel: "noopener", target: "_blank" } : attribs };
      },
    },
  });
}
