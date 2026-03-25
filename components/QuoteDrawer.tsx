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

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof items> = {};
    items.forEach((item) => {
      const brand = item.brand || "Other";
      if (!groups[brand]) groups[brand] = [];
      groups[brand].push(item);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-50 transition-all duration-300",
          isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-drawer z-50 flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-navy/10 flex items-center justify-center">
              <ShoppingCart className="w-4.5 h-4.5 text-navy" />
            </div>
            <div>
              <h2 className="font-display font-bold text-navy text-base">Quote Cart</h2>
              {count > 0 && (
                <p className="text-xs text-gray-500">{count} item{count !== 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-5">
                <ShoppingCart className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="font-display font-bold text-gray-700 mb-1.5 text-lg">
                Your quote cart is empty
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-[240px] leading-relaxed">
                Browse our catalog and add products to start building your
                custom quote
              </p>
              <Button
                variant="amber"
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl"
              >
                Browse Products
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedItems.map(([brand, brandItems]) => {
                const brandInfo = getBrandInfo(brand);
                return (
                  <div key={brand}>
                    {/* Brand header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                      {brandInfo.logo ? (
                        <Image
                          src={brandInfo.logo}
                          alt={brand}
                          width={60}
                          height={24}
                          className="h-5 w-auto object-contain"
                          unoptimized
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                          style={{ backgroundColor: brandInfo.color }}
                        >
                          {brand[0]}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-display">
                        {brand}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        ({brandItems.length})
                      </span>
                    </div>

                    {/* Brand items */}
                    <div className="space-y-2.5">
                      {brandItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-gray-200">
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
                                className="w-full h-full flex items-center justify-center text-xs font-bold"
                                style={{
                                  backgroundColor: brandInfo.color + "15",
                                  color: brandInfo.color,
                                }}
                              >
                                {item.brand[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate leading-snug">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                              {item.sku}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-3 text-sm font-semibold min-w-[2rem] text-center tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  className="p-1.5 hover:bg-gray-100 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {item.price ? (
                              <>
                                <p className="text-sm font-bold text-navy font-display">
                                  {formatPrice(
                                    parseFloat(item.price) * item.quantity
                                  )}
                                </p>
                                {item.quantity > 1 && (
                                  <p className="text-[11px] text-gray-400">
                                    {formatPrice(item.price)} ea
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-[11px] text-amber-dark font-medium">
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
          <div className="border-t border-gray-200 p-5 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Subtotal</span>
              <span className="text-xl font-bold text-navy font-display">
                {formatPrice(subtotal)}
              </span>
            </div>
            {subtotal === 0 && items.length > 0 && (
              <p className="text-xs text-gray-400">
                Some items require a quote for pricing
              </p>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="flex-1 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
              <Link
                href="/quote"
                className="flex-1"
                onClick={() => setDrawerOpen(false)}
              >
                <Button variant="amber" size="sm" className="w-full rounded-xl">
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
