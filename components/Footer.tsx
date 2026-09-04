"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/constants";

const FOOTER_LINKS = [
  { href: "/create", label: "Create Your Tag" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/faq#shipping", label: "Shipping" },
  { href: "/faq#returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/about#contact", label: "Contact" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder: wire to an email/newsletter provider (see .env.example).
    setSubmitted(true);
  };

  return (
    <footer className="border-t border-hairline mt-24">
      <div className="mx-auto max-w-content px-5 sm:px-8 py-14 grid gap-12 md:grid-cols-3">
        <div>
          <p className="font-display font-black text-xl">{SITE.name}</p>
          <p className="mt-3 text-sm text-muted max-w-[26ch]">
            Your tag says where you live.
            <br />
            You say who you are.
          </p>
          <div className="mt-6 flex gap-4 text-sm text-muted">
            <span aria-disabled="true">Instagram</span>
            <span aria-disabled="true">TikTok</span>
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-muted">
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSubmit} className="text-sm">
          <label
            htmlFor="newsletter-email"
            className="block font-display font-semibold uppercase tracking-wide text-xs mb-2"
          >
            What does your tag say?
          </label>
          {submitted ? (
            <p className="text-muted">You&apos;re on the list.</p>
          ) : (
            <div className="flex border border-ink">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3 py-2 bg-transparent outline-none placeholder:text-muted/70"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2 bg-ink text-paper font-medium hover:bg-ink/85 transition-colors"
              >
                Keep Me Posted
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="border-t border-hairline">
        <p className="mx-auto max-w-content px-5 sm:px-8 py-5 text-xs text-muted">
          &copy; {new Date().getFullYear()} {SITE.name} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
