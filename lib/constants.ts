import { FaqItem, SizeId } from "./types";

/** Central place to change copy/pricing without touching components. */

export const SITE = {
  name: "TAG SAYS.",
  tagline: "Your tag says where you live. You say who you are.",
  eyebrow: "WHERE YOU LIVE \u2260 WHO YOU ARE",
  heroHeadline: "LET YOUR TAG SAY MORE.",
  metaTitle: "TAG SAYS. | Custom Bumper Stickers That Say Where You're Really From",
  metaDescription:
    "Your tag says where you live. You say who you are. Create a personalized bumper sticker celebrating your hometown, culture, country, or identity.",
};

/**
 * The three physical sticker sizes offered at checkout, matching the
 * TAG SAYS. Printify catalog exactly. `widthIn`/`heightIn` are the real
 * product dimensions; `dpi` is fixed at 300 per the Printify print spec.
 * `printifyVariantId` is the exact variant in your Printify "TAG SAYS
 * Website" store (blueprint 598, print provider 73) that this size
 * fulfills through \u2014 see lib/printify.ts. Changing a size here
 * automatically updates the builder's size picker, the live preview's
 * proportions, pricing, and the print-file dimensions sent to Printify.
 */
export interface SizeOption {
  id: SizeId;
  label: string;
  widthIn: number;
  heightIn: number;
  dpi: number;
  priceCents: number;
  printifyVariantId: number;
}

export const SIZE_OPTIONS: SizeOption[] = [
  {
    id: "compact",
    label: '7.5" \u00d7 3.75"',
    widthIn: 7.5,
    heightIn: 3.75,
    dpi: 300,
    priceCents: 700,
    printifyVariantId: 71929,
  },
  {
    id: "classic",
    label: '11" \u00d7 3"',
    widthIn: 11,
    heightIn: 3,
    dpi: 300,
    priceCents: 900,
    printifyVariantId: 71930,
  },
  {
    id: "wide",
    label: '15" \u00d7 3.75"',
    widthIn: 15,
    heightIn: 3.75,
    dpi: 300,
    priceCents: 1200,
    printifyVariantId: 71931,
  },
];

export const DEFAULT_SIZE_ID: SizeId = "classic";

export function getSizeOption(sizeId: SizeId): SizeOption {
  return (
    SIZE_OPTIONS.find((size) => size.id === sizeId) ??
    SIZE_OPTIONS.find((size) => size.id === DEFAULT_SIZE_ID)!
  );
}

/** Placeholder currency for all sizes. Per-size pricing lives in SIZE_OPTIONS. */
export const PRICING = {
  currency: "USD",
};

export const IDENTITY_MAX_LENGTH = 24;
export const IDENTITY_WARN_LENGTH = 16;

export const EXAMPLE_TAGS: { state: string; identity: string }[] = [
  { state: "Georgia", identity: "New Yorker" },
  { state: "Georgia", identity: "Jamaican" },
  { state: "Texas", identity: "Chicago Born" },
  { state: "Florida", identity: "Haitian Made" },
  { state: "California", identity: "Brooklyn Raised" },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "What does your tag say?",
    body: "Choose the state on your current license plate.",
  },
  {
    number: "02",
    title: "Who are you?",
    body: "Add the city, state, culture, country, or identity that feels like home.",
  },
  {
    number: "03",
    title: "Stick it. Say it.",
    body: "We print your custom statement and ship it straight to you.",
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What can I put on my sticker?",
    answer:
      "Any city, state, country, culture, nationality, region, or hometown that feels like who you are \u2014 New Yorker, Jamaican, Chicago Born, Haitian Made, and everything in between.",
  },
  {
    question: "Can I use a country instead of a state?",
    answer:
      "Yes. The identity line isn't limited to U.S. states \u2014 use a country, a city, a culture, or a nickname that fits.",
  },
  {
    question: "What if my identity doesn't fit?",
    answer:
      "Keep it short and it'll fit. Long entries automatically shrink slightly in the live preview so your tag always stays legible \u2014 you'll see exactly how it looks before you order.",
  },
  {
    question: "Can I order multiple different tags?",
    answer:
      "Yes. Every tag you create is its own item, so a Georgia/New Yorker tag and a Florida/Jamaican tag can sit side by side in your cart.",
  },
  {
    question: "Are the bumper stickers weather resistant?",
    answer:
      "Material and durability specs will be published here once fulfillment is finalized.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Shipping times will be published here once our fulfillment partner is connected.",
  },
  {
    question: "Can I preview my sticker before purchasing?",
    answer:
      "Always. The Create Your Tag builder shows a live, true-to-print preview as you type \u2014 nothing goes to cart until it looks right.",
  },
];
