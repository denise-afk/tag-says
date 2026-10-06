import Link from "next/link";

/** Site-wide notice that every tag now ships as a car magnet. */
export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper text-center px-5 py-3.5 sm:py-4 text-sm sm:text-lg">
      <Link href="/create" className="hover:underline">
        <span className="font-display font-black uppercase tracking-wide text-xl sm:text-2xl block sm:inline">
          Now car magnets.
        </span>{" "}
        No paint damage. <span className="whitespace-nowrap">Free shipping.</span> <span className="whitespace-nowrap">Buy 2, save $5.</span>
      </Link>
    </div>
  );
}
