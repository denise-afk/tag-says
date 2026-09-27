/**
 * Meta (Facebook/Instagram) Pixel helpers.
 *
 * The pixel only loads when NEXT_PUBLIC_META_PIXEL_ID is set (Vercel →
 * Project Settings → Environment Variables). Until then every call here
 * is a harmless no-op, so the site behaves exactly as before.
 */

/** Pixel IDs are numeric; stripping anything else keeps the inline snippet safe. */
export const META_PIXEL_ID = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "").replace(/\D/g, "");

type FbqFn = (command: "track", event: string, params?: Record<string, unknown>) => void;

export function trackPixel(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !META_PIXEL_ID) return;
  const fbq = (window as unknown as { fbq?: FbqFn }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);
}
