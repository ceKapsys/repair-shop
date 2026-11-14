/** Placeholder body for routes scheduled in a later build week. */
export function PageStub({
  title,
  intro,
  week,
}: {
  title: string;
  intro?: string;
  week: string;
}) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:py-24">
      <h1 className="text-3xl font-semibold md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg text-ink-soft">{intro}</p>}
      <p className="mt-8 inline-block rounded-full border border-line px-3 py-1 text-sm text-ink-soft">
        Coming in {week}
      </p>
    </section>
  );
}
