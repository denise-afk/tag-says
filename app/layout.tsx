import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SITE } from "@/lib/constants";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-condensed",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE.metaTitle,
  description: SITE.metaDescription,
  openGraph: {
    title: SITE.metaTitle,
    description: SITE.metaDescription,
    siteName: SITE.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body>
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2"
          >
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
