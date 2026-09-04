"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const NAV_LINKS = [
  { href: "/create", label: "Create Your Tag" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/#shop", label: "Shop" },
  { href: "/about", label: "About" },
];

export function Header() {
  const { itemCount, isHydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur border-b border-hairline">
      <div className="mx-auto max-w-content px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-display font-black text-xl tracking-tight"
        >
          TAG SAYS.
        </Link>

        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-sm font-medium"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/cart"
          className="flex items-center gap-2 text-sm font-medium"
          aria-label={`Cart, ${isHydrated ? itemCount : 0} item${itemCount === 1 ? "" : "s"}`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 6h15l-1.5 9h-12L6 6Zm0 0-1-3H2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9.5" cy="19" r="1.3" fill="currentColor" />
            <circle cx="17" cy="19" r="1.3" fill="currentColor" />
          </svg>
          <span>{isHydrated ? itemCount : 0}</span>
        </Link>
      </div>

      {/* Mobile nav */}
      <nav
        aria-label="Primary mobile"
        className="md:hidden flex items-center gap-5 overflow-x-auto px-5 pb-3 text-sm font-medium border-t border-hairline pt-3"
      >
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="whitespace-nowrap">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
