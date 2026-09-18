const CONCEPT_PHOTOS = [
  {
    src: "/images/road-georgia-new-yorker.jpg",
    alt: "Concept rendering of a Georgia Tag, New Yorker bumper sticker on a car in traffic",
  },
  {
    src: "/images/road-florida-haitian-made.jpg",
    alt: "Concept rendering of a Florida Tag, Haitian Made bumper sticker on a car at sunset",
  },
];

export function SocialProofSection() {
  const openSlots = Array.from(
    { length: Math.max(0, 4 - CONCEPT_PHOTOS.length) },
    (_, i) => i
  );

  return (
    <section className="border-t border-hairline">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-16 sm:py-24">
        <h2 className="font-display font-black uppercase text-3xl sm:text-4xl">
          See it on the road.
        </h2>
        <p className="mt-3 text-muted max-w-[52ch]">
          Concept renderings of TAG SAYS. in everyday life &mdash; real
          customer photos coming soon.
        </p>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CONCEPT_PHOTOS.map((photo) => (
            <div
              key={photo.src}
              className="aspect-square border border-hairline overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}

          {openSlots.map((n) => (
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
