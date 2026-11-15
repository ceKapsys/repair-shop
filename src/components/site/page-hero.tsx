export function PageHero({
  title,
  intro,
  eyebrow,
  actions,
  children,
  crumbs,
  variant = "default",
}: {
  title: string;
  intro?: string | null;
  eyebrow?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  crumbs?: React.ReactNode;
  variant?: "default" | "emergency";
}) {
  const pillClass =
    variant === "emergency"
      ? "border-emergency/25 bg-emergency/10 text-emergency"
      : "border-line bg-bg text-primary";

  return (
    <section className="border-b border-line bg-surface pt-8 pb-12 md:pt-12 md:pb-16">
      <div className="container-page">
        {crumbs}
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {eyebrow && (
              <span
                className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${pillClass}`}
              >
                {eyebrow}
              </span>
            )}
            <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {intro && (
              <p className="mt-3 text-base leading-relaxed text-ink-soft md:text-lg">
                {intro}
              </p>
            )}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}
