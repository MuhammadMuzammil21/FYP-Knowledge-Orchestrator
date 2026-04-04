const companies = [
  'Acme Corp',
  'Startup Labs',
  'Product Co.',
  'Agency HQ',
  'Dev Studio',
  'Remote Team',
];

export function TrustBar() {
  return (
    <section className="py-12 border-y border-border/50 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-6">
        <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
          Trusted by teams at
        </p>
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
          {companies.map((company) => (
            <span
              key={company}
              className="text-sm font-semibold text-muted-foreground/40 tracking-tight select-none"
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
