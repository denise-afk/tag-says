import { IDENTITY_MAX_LENGTH, LINE_ONE_STATEMENT_MAX_LENGTH } from "./constants";
import { TagCustomization, TagMode } from "./types";

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

/** Applies a character limit without cutting mid-word where avoidable. */
export function clampLength(value: string, max: number): string {
  return value.slice(0, max);
}

/** @deprecated use clampLength */
export function clampIdentityLength(
  value: string,
  max: number = IDENTITY_MAX_LENGTH
): string {
  return clampLength(value, max);
}

/**
 * Line one, formatted for its mode. "state" mode appends " TAG." (e.g.
 * "Georgia" -> "GEORGIA TAG."); "statement" mode just uppercases and
 * adds a trailing period (e.g. "Isaiah 6:3" -> "ISAIAH 6:3.").
 */
export function formatLineOne(mode: TagMode, raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (mode === "state") return `${trimmed.toUpperCase()} TAG.`;
  return `${trimmed.toUpperCase()}.`;
}

/** Line two is always free text, always just uppercased with a period. */
export function formatLineTwo(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return `${trimmed.toUpperCase()}.`;
}

/** @deprecated use formatLineOne(\"state\", stateName) */
export function formatTagLine(stateName: string): string {
  return formatLineOne("state", stateName);
}

/** @deprecated use formatLineTwo */
export function formatIdentityLine(identity: string): string {
  return formatLineTwo(identity);
}

export interface StickerRender {
  lineOne: string;
  lineTwo: string;
  isValid: boolean;
}

export function buildStickerRender(
  mode: TagMode,
  lineOneRaw: string,
  lineTwoRaw: string
): StickerRender {
  const lineOne = formatLineOne(mode, lineOneRaw);
  const lineTwo = formatLineTwo(lineTwoRaw);
  return {
    lineOne,
    lineTwo,
    isValid: Boolean(lineOneRaw.trim()) && Boolean(lineTwoRaw.trim()),
  };
}

export function buildStickerRenderFromCustomization(
  customization: TagCustomization
): StickerRender {
  return buildStickerRender(
    customization.mode,
    customization.lineOneRaw,
    customization.lineTwoRaw
  );
}

/**
 * Rough scale factor so long lines shrink instead of overflowing or
 * wrapping awkwardly on the sticker face. Tunable.
 */
export function lineScaleFactor(text: string): number {
  const len = text.trim().length;
  if (len <= 10) return 1;
  if (len <= 16) return 0.85;
  if (len <= 20) return 0.72;
  return 0.62;
}

/** @deprecated use lineScaleFactor */
export function identityScaleFactor(identity: string): number {
  return lineScaleFactor(identity);
}

export { LINE_ONE_STATEMENT_MAX_LENGTH };
