import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/editor-shell";
import { Badge } from "@/components/ui/field";
import { connectDb } from "@/lib/db";
import { ISSUE_LABELS, seoHealth } from "@/lib/seo-health";
import { plain } from "@/lib/serialize";
import { loadSettings } from "@/lib/settings";
import type { RedirectT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PAGE_KEYS, Redirect } from "@/models";
import { RedirectsManager } from "./redirects-manager";
import { SeoDefaultsForm } from "./seo-defaults-form";

export const metadata: Metadata = { title: "SEO" };

const tabs = [
  { id: "health", label: "Health" },
  { id: "pages", label: "Pages" },
  { id: "redirects", label: "Redirects" },
  { id: "defaults", label: "Defaults" },
] as const;

export default async function SeoAdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const tab = tabs.find((t) => t.id === sp.tab)?.id ?? "health";
  await connectDb();
  return (
    <>
      <PageHeader title="SEO" description="Each service, device and post has its own SEO tab. This screen covers the rest." />
      <nav aria-label="SEO sections" className="mt-4 flex gap-1 overflow-x-auto border-b border-line px-4 md:px-8">
        {tabs.map((t) => (
          <Link key={t.id} href={`/admin/seo?tab=${t.id}`} aria-current={tab === t.id ? "page" : undefined} className={cn("flex min-h-11 items-center border-b-2 px-3 text-sm", tab === t.id ? "border-primary font-medium text-ink" : "border-transparent text-ink-soft hover:text-ink")}>
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 py-6 md:px-8">
        {tab === "health" && <Health />}
        {tab === "pages" && <Pages />}
        {tab === "redirects" && <RedirectsManager redirects={plain<RedirectT[]>(await Redirect.find().sort({ updatedAt: -1 }).lean())} />}
        {tab === "defaults" && <Defaults />}
      </div>
    </>
  );
}

async function Health() {
  const rows = await seoHealth();
  const bad = rows.filter((r) => r.issues.length);
  return (
    <>
      <p className="text-sm text-ink-soft">{bad.length === 0 ? "Every page has its SEO fields filled in." : `${bad.length} of ${rows.length} pages need attention.`}</p>
      <div className="mt-4 overflow-x-auto rounded-card border border-line bg-bg">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th scope="col" className="px-4 py-3 font-medium">Page</th>
              <th scope="col" className="px-4 py-3 font-medium">Type</th>
              <th scope="col" className="px-4 py-3 font-medium">Needs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.editHref}>
                <td className="px-4 py-2"><Link href={r.editHref} className="inline-flex min-h-11 items-center font-medium hover:text-primary">{r.title}</Link></td>
                <td className="px-4 py-2 text-ink-soft">{r.type}</td>
                <td className="px-4 py-2">
                  {r.issues.length === 0 ? <Badge tone="success">Good</Badge> : <span className="flex flex-wrap gap-1.5">{r.issues.map((i) => <Badge key={i} tone="warning">{ISSUE_LABELS[i]}</Badge>)}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Pages() {
  return (
    <>
      <p className="text-sm text-ink-soft">Search title, description and social image for the fixed pages. About, Privacy, Terms and Service area also have editable text.</p>
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
        {Object.entries(PAGE_KEYS).map(([key, p]) => (
          <li key={key}>
            <Link href={`/admin/seo/page/${key}`} className="flex min-h-14 items-center justify-between gap-4 px-4 hover:bg-surface">
              <span className="font-medium">{p.title}</span>
              <span className="text-sm text-ink-soft">{p.path}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

async function Defaults() {
  const s = await loadSettings();
  return <SeoDefaultsForm initial={{ titleTemplate: s.seoDefaults.titleTemplate, description: s.seoDefaults.description, ogImage: s.seoDefaults.ogImage ?? "" }} />;
}
