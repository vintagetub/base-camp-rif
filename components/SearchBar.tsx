"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAllProducts, getCatalogProducts, type Product } from "@/lib/products";
import { formatPrice, cn } from "@/lib/utils";
import Image from "next/image";

interface SearchBarProps {
  compact?: boolean;
  onNavigate?: () => void;
}

export function SearchBar({ compact, onNavigate }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    const lower = q.toLowerCase();
    const products = getAllProducts();
    const matches = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.sku.toLowerCase().includes(lower) ||
          p.brand.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.id.toLowerCase().includes(lower) ||
          (p.upc || "").toLowerCase().includes(lower) ||
          (p.homeDepotId || "").toLowerCase().includes(lower) ||
          (p.basePart || "").toLowerCase().includes(lower)
      )
      .slice(0, 5);
    setResults(matches);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (query.trim()) setIsSearching(true);
    const timer = setTimeout(() => search(query), 150);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigateToProduct = (product: Product) => {
    setQuery("");
    setIsOpen(false);
    onNavigate?.();
    router.push(`/products/${product.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        navigateToProduct(results[selectedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        onNavigate?.();
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const getVariantCount = (p: Product) => {
    if (p.isParent && p.childVariantIds) return p.childVariantIds.length;
    return 0;
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400",
            compact ? "w-4 h-4" : "w-5 h-5"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "Search... (/)" : "Search products, SKUs, brands..."}
          className={cn(
            "w-full rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:bg-white/15 transition-all",
            compact ? "pl-9 pr-8 py-1.5 text-sm" : "pl-10 pr-10 py-2.5 text-sm"
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (results.length > 0 || (query && !isSearching)) && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full min-w-80 bg-white rounded-xl shadow-elevated border border-gray-200 overflow-hidden z-50 animate-scale-in"
        >
          {isSearching && (
            <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <>
              {results.map((product, i) => {
                const variantCount = getVariantCount(product);
                return (
                  <button
                    key={product.id}
                    onClick={() => navigateToProduct(product)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-0",
                      selectedIndex === i
                        ? "bg-navy-50"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium">
                          {product.brand[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {product.shortName || product.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {product.brand} &middot; SKU: {product.sku}
                        {variantCount > 0 && (
                          <span className="ml-1 text-navy font-medium">
                            &middot; {variantCount} variant{variantCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                  router.push(
                    `/products?search=${encodeURIComponent(query.trim())}`
                  );
                }}
                className="w-full px-4 py-3 text-sm text-center text-navy font-semibold hover:bg-navy/5 transition-colors"
              >
                View all results for &ldquo;{query}&rdquo;
              </button>
            </>
          )}

          {!isSearching && query && results.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">
                No products found for &ldquo;{query}&rdquo;
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigate?.();
                  router.push(`/products`);
                }}
                className="mt-2 text-sm text-navy font-semibold hover:underline"
              >
                Browse all products
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
