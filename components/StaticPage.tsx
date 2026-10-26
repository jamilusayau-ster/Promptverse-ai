export default function StaticPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-semibold leading-tight">{title}</h1>
      {updated && <p className="mt-2 text-xs text-muted">Last updated: {updated}</p>}
      <div className="mt-8 space-y-4 text-[15px] leading-relaxed text-ink/90 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_a]:text-electric [&_a]:underline">
        {children}
      </div>
    </div>
  );
}
