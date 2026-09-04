export function SocialProofSection() {
  const placeholders = [1, 2, 3, 4];

  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="font-display font-black uppercase text-3xl sm:text-4xl">
          Spotted in the wild.
        </h2>
        <p className="mt-3 text-muted">Different tags. Different stories.</p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {placeholders.map((n) => (
            <div
              key={n}
              className="aspect-square border border-dashed border-hairline flex items-center justify-center text-xs text-muted text-center px-3"
            >
              Customer photo coming soon
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
