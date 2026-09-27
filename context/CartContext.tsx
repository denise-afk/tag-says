"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartLineItem, TagCustomization } from "@/lib/types";
import { getSizeOption } from "@/lib/constants";
import { buildStickerRenderFromCustomization } from "@/lib/sticker";
import { bundleDiscountPerTagCents } from "@/lib/pricing";
import { trackPixel } from "@/lib/metaPixel";

const STORAGE_KEY = "tagsays:cart:v1";

interface CartContextValue {
  items: CartLineItem[];
  itemCount: number;
  /** Before the bundle deal. */
  subtotalCents: number;
  /** Bundle savings across the whole cart (0 with fewer than 2 tags). */
  bundleSavingsCents: number;
  /** What the customer pays before shipping/tax/promo codes. */
  totalCents: number;
  addItem: (customization: TagCustomization, quantity: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readStoredCart(): CartLineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CartLineItem[];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLineItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load persisted cart once, on mount, client-side only.
  useEffect(() => {
    setItems(readStoredCart());
    setIsHydrated(true);
  }, []);

  // Persist on every change, after initial hydration.
  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = (customization: TagCustomization, quantity: number) => {
    const render = buildStickerRenderFromCustomization(customization);
    if (!render.isValid) return;

    const newItem: CartLineItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      productSlug: "custom-tag",
      productName: "Personalized Bumper Sticker",
      customization,
      renderedLineOne: render.lineOne,
      renderedLineTwo: render.lineTwo,
      quantity: Math.max(1, quantity),
      unitPriceCents: getSizeOption(customization.sizeId).priceCents,
      addedAt: new Date().toISOString(),
    };

    // Every customized item is distinct — never merged with another line,
    // even if two items happen to share the same state/identity pair.
    setItems((prev) => [...prev, newItem]);
    trackPixel("AddToCart", {
      value: (newItem.unitPriceCents * newItem.quantity) / 100,
      currency: "USD",
      content_name: `${render.lineOne} / ${render.lineTwo}`,
      contents: [{ id: customization.sizeId, quantity: newItem.quantity }],
      content_type: "product",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotalCents = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.unitPriceCents * item.quantity,
        0
      ),
    [items]
  );

  const bundleSavingsCents = bundleDiscountPerTagCents(itemCount) * itemCount;
  const totalCents = subtotalCents - bundleSavingsCents;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotalCents,
        bundleSavingsCents,
        totalCents,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isHydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
