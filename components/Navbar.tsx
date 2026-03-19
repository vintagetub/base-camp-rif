"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, Search, Ruler } from "lucide-react";
import { ThemeToggle } from "./ThemeProvider";
import { useQuoteStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getAllProducts, type Product } from "@/lib/products";
import { formatPrice } from "@/lib/utils";
import { CHANNEL } from "@/lib/channel";
import Image from "next/image";

const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/brands", label: "Brands" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/resources", label: "Pro Resources" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const itemCount = useQuoteStore((s) => s.getItemCount());
  const toggleDrawer = useQuoteStore((s) => s.toggleDrawer);

  /* ---------------------------------------------------------------- */
  /*  Scroll detection for shrink behavior                            */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Keyboard shortcuts                                              */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);

      // "/" to open search
      if (e.key === "/" && !isInput) {
        e.preventDefault();
        setSearchOpen(true);
      }

      // "c" for chat
      if (e.key === "c" && !isInput && !e.metaKey && !e.ctrlKey) {
        // Dispatch a custom event that the chat widget can listen to
        window.dispatchEvent(new CustomEvent("open-chat"));
      }

      // Escape to close search
      if (e.key === "Escape" && searchOpen) {
        closeSearch();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [searchOpen]);

  /* ---------------------------------------------------------------- */
  /*  Focus input when search overlay opens                           */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (searchOpen) {
      // Small delay so the overlay renders first
      const t = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  /* ---------------------------------------------------------------- */
  /*  Search logic                                                    */
  /* ---------------------------------------------------------------- */
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
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
      .slice(0, 8);
    setResults(matches);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 150);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setSelectedIndex(-1);
  };

  const navigateToProduct = (product: Product) => {
    closeSearch();
    router.push(`/products/${product.id}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
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
        closeSearch();
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      }
    } else if (e.key === "Escape") {
      closeSearch();
    }
  };

  const price = (p: Product) =>
    formatPrice(p.pricing.basePrice || p.pricing.listPrice || p.pricing.msrp);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 bg-navy text-white shadow-lg transition-all duration-300",
          scrolled ? "shadow-xl" : ""
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between transition-all duration-300",
              scrolled ? "h-14" : "h-[72px]"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/american-bath-group/image/upload/v1648488050/abg-graphics/logos/abg/abg-logos/svg/abg-logo-horizontal.svg"
                alt="American Bath Group"
                className={cn(
                  "brightness-0 invert transition-all duration-300",
                  scrolled ? "h-6" : "h-8"
                )}
              />
              <span className="hidden sm:inline text-xs font-bold bg-amber/20 text-amber-light px-2 py-0.5 rounded tracking-wide">
                {CHANNEL.id !== "all" ? `${CHANNEL.name.toUpperCase()} PRO` : "PRO SALES"}
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href ||
                      pathname.startsWith(link.href + "/")
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline text-sm text-white/60">
                  Search
                </span>
                <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-white/50 text-xs font-mono">
                  /
                </kbd>
              </button>

              {/* Theme toggle */}
              <ThemeToggle />

              {/* Cart button */}
              <button
                onClick={toggleDrawer}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Open quote cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber text-navy text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse-soft">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors md:hidden"
                aria-label="Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-navy-dark">
            <nav className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-white/15 text-white"
                      : "text-white/80 hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/*  SEARCH OVERLAY (command palette style)                      */}
      {/* ============================================================ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-navy-900/70 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Search panel */}
          <div className="relative max-w-2xl mx-auto mt-[15vh] px-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 border-b border-gray-200">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSelectedIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search products, SKUs, brands..."
                  className="flex-1 py-4 text-base text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setResults([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <kbd className="hidden md:inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-400 text-xs font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="max-h-[50vh] overflow-y-auto">
                  {results.map((product, i) => (
                    <button
                      key={product.id}
                      onClick={() => navigateToProduct(product)}
                      className={cn(
                        "w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0",
                        selectedIndex === i && "bg-gray-50"
                      )}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.shortName || product.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {product.brand} &middot; SKU: {product.sku}
                          {product.isParent && product.childVariantIds && product.childVariantIds.length > 0 && (
                            <span className="ml-1 text-navy font-medium">
                              &middot; {product.childVariantIds.length} variant{product.childVariantIds.length !== 1 ? "s" : ""}
                            </span>
                          )}
                        </p>
                      </div>
                      {price(product) && (
                        <span className="text-sm font-semibold text-navy shrink-0">
                          {price(product)}
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      closeSearch();
                      router.push(
                        `/products?search=${encodeURIComponent(query.trim())}`
                      );
                    }}
                    className="w-full px-5 py-3 text-sm text-center text-navy font-medium hover:bg-navy/5 transition-colors"
                  >
                    View all results for &ldquo;{query}&rdquo;
                  </button>
                </div>
              )}

              {query && results.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <p className="text-sm text-gray-500">
                    No products found for &ldquo;{query}&rdquo;
                  </p>
                  <button
                    onClick={() => {
                      closeSearch();
                      router.push(`/products`);
                    }}
                    className="mt-2 text-sm text-navy font-medium hover:underline"
                  >
                    Browse all products
                  </button>
                </div>
              )}

              {!query && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-gray-400">
                    Type to search products, SKUs, or brands
                  </p>
                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">
                        &uarr;&darr;
                      </kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">
                        Enter
                      </kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono">
                        Esc
                      </kbd>
                      Close
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
