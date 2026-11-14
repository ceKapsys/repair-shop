export function PageHero({ title, intro, children, crumbs }: { title: string; intro?: string | null; children?: React.ReactNode; crumbs?: React.ReactNode }) {
  return (
    <section className="container-page pt-8 pb-10 md:pt-12 md:pb-14">
      {crumbs}
      <h1 className="mt-6 max-w-[20ch]">{title}</h1>
      {intro && <p className="mt-4 max-w-[60ch] text-ink-soft">{intro}</p>}
      {children}
    </section>
  );
}
