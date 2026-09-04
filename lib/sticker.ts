import { IDENTITY_MAX_LENGTH } from "./constants";

/**
 * Strips anything that isn't plain text: no tags, no scripts, no control
 * characters. Collapses repeated whitespace and trims the ends.
 */
export function sanitizeIdentityInput(raw: string): string {
  const noTags = raw.replace(/<[^>]*>/g, "");
  const noControl = noTags.replace(/[\u0000-\u001F\u007F]/g, "");
  const collapsedSpaces = noControl.replace(/\s+/g, " ");
  return collapsedSpaces.trimStart();
}

/** Applies the character limit without cutting mid-word where avoidable. */
export function clampIdentityLength(
  value: string,
  max: number = IDENTITY_MAX_LENGTH
): string {
  return value.slice(0, max);
}

export function formatTagLine(stateName: string): string {
  return `${stateName.toUpperCase()} TAG.`;
}

export function formatIdentityLine(identity: string): string {
  const trimmed = identity.trim();
  if (!trimmed) return "";
  return `${trimmed.toUpperCase()}.`;
}

export interface StickerRender {
  lineOne: string;
  lineTwo: string;
  isValid: boolean;
}

export function buildStickerRender(
  stateName: string,
  identity: string
): StickerRender {
  const lineOne = stateName ? formatTagLine(stateName) : "";
  const lineTwo = formatIdentityLine(identity);
  return {
    lineOne,
    lineTwo,
    isValid: Boolean(stateName) && Boolean(identity.trim()),
  };
}

/**
 * Rough scale factor so long identity lines shrink instead of overflowing
 * or wrapping awkwardly on the sticker face. Tunable.
 */
export function identityScaleFactor(identity: string): number {
  const len = identity.trim().length;
  if (len <= 10) return 1;
  if (len <= 16) return 0.85;
  if (len <= 20) return 0.72;
  return 0.62;
}
