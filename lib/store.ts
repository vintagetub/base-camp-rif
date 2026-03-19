"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface QuoteItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  image: string;
  price: string;
  quantity: number;
  parentId?: string;
  variantDescription?: string;
}

interface QuoteStore {
  items: QuoteItem[];
  isDrawerOpen: boolean;
  recentlyViewed: string[];
  addItem: (item: Omit<QuoteItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearAll: () => void;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  addRecentlyViewed: (id: string) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      recentlyViewed: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
        set({ isDrawerOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        });
      },

      clearAll: () => set({ items: [] }),

      toggleDrawer: () => set({ isDrawerOpen: !get().isDrawerOpen }),

      setDrawerOpen: (open) => set({ isDrawerOpen: open }),

      addRecentlyViewed: (id) => {
        const rv = get().recentlyViewed.filter((r) => r !== id);
        rv.unshift(id);
        set({ recentlyViewed: rv.slice(0, 20) });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = parseFloat(item.price);
          return total + (isNaN(price) ? 0 : price * item.quantity);
        }, 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "abg-quote-store",
      partialize: (state) => ({
        items: state.items,
        recentlyViewed: state.recentlyViewed,
      }),
    }
  )
);
