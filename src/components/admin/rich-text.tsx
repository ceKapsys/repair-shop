"use client";

import { useState } from "react";
import { EditorContent, Node, mergeAttributes, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Megaphone, Minus, Quote, Redo2, Table, Underline, Undo2, Unlink,
} from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { getLinkTargets } from "@/app/admin/(panel)/link-targets";
import { useForm } from "./form";

/** Callout block: <aside data-callout>…</aside> */
const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML: () => [{ tag: "aside[data-callout]" }],
  renderHTML: ({ HTMLAttributes }) => ["aside", mergeAttributes(HTMLAttributes, { "data-callout": "" }), 0],
});

type Target = { label: string; href: string; group: string };

function Btn({ on, label, active, children, disabled }: { on: () => void; label: string; active?: boolean; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={on}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled}
      className={cn("flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-foreground disabled:opacity-30", active && "bg-surface text-foreground")}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor, folder }: { editor: Editor; folder: string }) {
  const [targets, setTargets] = useState<Target[] | null>(null);
  const [picker, setPicker] = useState(false);
  const [q, setQ] = useState("");
  const c = () => editor.chain().focus();

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (https://… or /page)", prev ?? "https://");
    if (url === null) return;
    if (!url) c().unsetLink().run();
    else c().extendMarkRange("link").setLink({ href: url }).run();
  };
  const openPicker = async () => {
    setPicker((p) => !p);
    if (!targets) setTargets(await getLinkTargets());
  };
  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const alt = window.prompt("Describe this image (alt text, required):", "");
      if (!alt) return toast.error("Alt text is required for images");
      try {
        const up = await uploadImage(file, folder);
        c().setImage({ src: up.url, alt }).run();
      } catch (e) {
        const url = window.prompt(`${e instanceof Error ? e.message : "Upload failed"}\n\nPaste an image URL instead:`);
        if (url) c().setImage({ src: url, alt }).run();
      }
    };
    input.click();
  };

  const s = 18, w = 1.5;
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-border bg-background p-1">
      <Btn label="Heading 2" active={editor.isActive("heading", { level: 2 })} on={() => c().toggleHeading({ level: 2 }).run()}><Heading2 size={s} strokeWidth={w} /></Btn>
      <Btn label="Heading 3" active={editor.isActive("heading", { level: 3 })} on={() => c().toggleHeading({ level: 3 }).run()}><Heading3 size={s} strokeWidth={w} /></Btn>
      <Btn label="Bold" active={editor.isActive("bold")} on={() => c().toggleBold().run()}><Bold size={s} strokeWidth={w} /></Btn>
      <Btn label="Italic" active={editor.isActive("italic")} on={() => c().toggleItalic().run()}><Italic size={s} strokeWidth={w} /></Btn>
      <Btn label="Underline" active={editor.isActive("underline")} on={() => c().toggleUnderline().run()}><Underline size={s} strokeWidth={w} /></Btn>
      <Btn label="Bullet list" active={editor.isActive("bulletList")} on={() => c().toggleBulletList().run()}><List size={s} strokeWidth={w} /></Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} on={() => c().toggleOrderedList().run()}><ListOrdered size={s} strokeWidth={w} /></Btn>
      <Btn label="Quote" active={editor.isActive("blockquote")} on={() => c().toggleBlockquote().run()}><Quote size={s} strokeWidth={w} /></Btn>
      <Btn label="Callout" active={editor.isActive("callout")} on={() => (editor.isActive("callout") ? c().lift("callout").run() : c().wrapIn("callout").run())}><Megaphone size={s} strokeWidth={w} /></Btn>
      <Btn label="Divider" on={() => c().setHorizontalRule().run()}><Minus size={s} strokeWidth={w} /></Btn>
      <Btn label="Link" active={editor.isActive("link")} on={setLink}><Link2 size={s} strokeWidth={w} /></Btn>
      <Btn label="Remove link" disabled={!editor.isActive("link")} on={() => c().unsetLink().run()}><Unlink size={s} strokeWidth={w} /></Btn>
      <div className="relative">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={openPicker} className="h-10 rounded-lg px-2.5 text-sm text-muted hover:bg-surface hover:text-foreground">
          Internal link
        </button>
        {picker && (
          <div className="absolute top-11 left-0 z-20 w-72 rounded-[var(--radius-input)] border border-border bg-background p-2 shadow-3">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages…" className="h-10 w-full rounded-lg border border-border bg-background px-2 text-sm" />
            <div className="mt-1 max-h-64 overflow-y-auto">
              {!targets && <p className="p-2 text-sm text-muted">Loading…</p>}
              {targets
                ?.filter((t) => !q || t.label.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 40)
                .map((t) => (
                  <button
                    key={t.href}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (editor.state.selection.empty) c().insertContent(`<a href="${t.href}">${t.label}</a> `).run();
                      else c().extendMarkRange("link").setLink({ href: t.href }).run();
                      setPicker(false);
                    }}
                    className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-surface"
                  >
                    <span className="text-muted">{t.group} · </span>{t.label}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      <Btn label="Image" on={insertImage}><ImagePlus size={s} strokeWidth={w} /></Btn>
      <Btn label="Table" on={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table size={s} strokeWidth={w} /></Btn>
      {editor.isActive("table") && (
        <>
          <button type="button" onClick={() => c().addRowAfter().run()} className="h-10 rounded-lg px-2 text-xs text-muted hover:bg-surface">+ row</button>
          <button type="button" onClick={() => c().addColumnAfter().run()} className="h-10 rounded-lg px-2 text-xs text-muted hover:bg-surface">+ col</button>
          <button type="button" onClick={() => c().deleteTable().run()} className="h-10 rounded-lg px-2 text-xs text-emergency hover:bg-surface">delete table</button>
        </>
      )}
      <span className="ml-auto flex">
        <Btn label="Undo" on={() => c().undo().run()}><Undo2 size={s} strokeWidth={w} /></Btn>
        <Btn label="Redo" on={() => c().redo().run()}><Redo2 size={s} strokeWidth={w} /></Btn>
      </span>
    </div>
  );
}

/** Tiptap editor bound to a {json, html} field. */
export default function RichTextInput({ name, label, folder = "blog", minHeight = 320 }: { name: string; label: string; folder?: string; minHeight?: number }) {
  const f = useForm();
  const initial = f.get(name) as { json?: object; html?: string } | undefined;
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, link: { openOnClick: false, autolink: true } }),
      Image,
      TableKit.configure({ table: { resizable: false } }),
      Callout,
    ],
    content: (initial?.json as object) ?? initial?.html ?? "",
    editorProps: {
      attributes: { class: "prose-content max-w-none px-4 py-3 outline-none", style: `min-height:${minHeight}px`, "aria-label": label },
    },
    onUpdate: ({ editor }) => f.set(name, { json: editor.getJSON(), html: editor.getHTML() }),
  });
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1.5 rounded-[var(--radius-input)] border border-border bg-background focus-within:outline-2 focus-within:outline-primary">
        {editor && <Toolbar editor={editor} folder={folder} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
