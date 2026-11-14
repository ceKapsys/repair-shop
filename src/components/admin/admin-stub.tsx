export function AdminStub({ title, week, items }: { title: string; week: string; items: string[] }) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-ink-soft">Scheduled for {week}</p>
      <ul className="mt-6 max-w-2xl list-disc space-y-1.5 pl-5 text-[15px] text-ink-soft">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
