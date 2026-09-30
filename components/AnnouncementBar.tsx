import Link from "next/link";

/** Site-wide notice that every tag now ships as a car magnet. */
export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper text-center px-5 py-2.5 text-xs sm:text-sm">
      <Link href="/create" className="hover:underline">
        <span className="font-display font-black uppercase tracking-wide">
          Now car magnets.
        </span>{" "}
        No sticky residue. No paint damage. Buy 2, save $5.
      </Link>
    </div>
  );
}
