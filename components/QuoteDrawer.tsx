"use client";

import { X, Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuoteStore } from "@/lib/store";
import { getBrandInfo } from "@/lib/brands";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useEffect, useMemo } from "react";

export function QuoteDrawer() {
  const {
    items,
    isDrawerOpen,
    setDrawerOpen,
    removeItem,
    updateQuantity,
    clearAll,
    getSubtotal,
    getItemCount,
  } = useQuoteStore();

  // Close on escape, toggle on Q
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) setDrawerOpen(false);
      if (
        e.key === "q" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        setDrawerOpen(!isDrawerOpen);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isDrawerOpen, setDrawerOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const subtotal = getSubtotal();
  const count = getItemCount();

  // Group items by brand
  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach((item) => {
      const brand = item.brand || "Other";
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(item);
    });
    // Sort brand groups alphabetically
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300",
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-surface shadow-drawer z-50 flex flex-col transition-transform duration-300 ease-out",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-surface-sunken">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-navy" />
            <h2 className="font-semibold text-navy text-lg">Quote Cart</h2>
            {count > 0 && (
              <span className="bg-amber text-navy text-xs font-bold rounded-full px-2 py-0.5">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg hover:bg-surface-sunken transition-colors"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 bg-surface-sunken rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-border-default" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1 text-lg">
                Your quote cart is empty
              </h3>
              <p className="text-sm text-text-tertiary mb-6 max-w-[240px]">
                Browse our catalog and add products to start building your
                custom quote
              </p>
              <Button
                variant="amber"
                onClick={() => setDrawerOpen(false)}
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-5">
              {groupedItems.map(([brand, brandItems]) => {
                const brandInfo = getBrandInfo(brand);
                return (
                  <div key={brand}>
                    {/* Brand header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border-subtle">
                      {brandInfo.logo ? (
                        <Image
                          src={brandInfo.logo}
                          alt={brand}
                          width={60}
                          height={24}
                          className="h-6 w-auto object-contain"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: brandInfo.color }}
                        >
                          {brand[0]}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        {brand}
                      </span>
                      <span className="text-xs text-text-tertiary">
                        ({brandItems.length})
                      </span>
                    </div>

                    {/* Brand items */}
                    <div className="space-y-2">
                      {brandItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 bg-surface-sunken rounded-lg"
                        >
                          <div className="w-14 h-14 bg-surface rounded-lg overflow-hidden flex-shrink-0 border border-border-subtle">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={56}
                                height={56}
                                className="w-full h-full object-contain p-1"
                                unoptimized
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                                style={{
                                  backgroundColor: brandInfo.color + "20",
                                  color: brandInfo.color,
                                }}
                              >
                                {item.brand[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate leading-snug">
                              {item.name}
                            </p>
                            <p className="text-xs text-text-tertiary font-mono mt-0.5">
                              {item.sku}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-border-default rounded-lg bg-surface">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-1 hover:bg-surface-sunken rounded-l-lg transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-3 text-sm font-medium min-w-[2rem] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="p-1 hover:bg-surface-sunken rounded-r-lg transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 text-text-tertiary hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {item.price ? (
                              <>
                                <p className="text-sm font-bold text-navy">
                                  {formatPrice(
                                    parseFloat(item.price) * item.quantity
                                  )}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-xs text-text-tertiary">
                                    {formatPrice(item.price)} ea
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-amber-dark font-medium">
                                TBD
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border-subtle p-4 bg-surface-sunken space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Estimated Subtotal</span>
              <span className="text-xl font-bold text-navy">
                {formatPrice(subtotal)}
              </span>
            </div>
            {subtotal === 0 && items.length > 0 && (
              <p className="text-xs text-text-tertiary">
                Some items require a quote for pricing
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
              <Link
                href="/quote"
                className="flex-1"
                onClick={() => setDrawerOpen(false)}
              >
                <Button variant="amber" size="sm" className="w-full">
                  Submit Quote
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
