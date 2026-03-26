"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Search,
  ShoppingCart,
  MessageCircle,
  Shield,
  Bath,
  DoorOpen,
  Square,
  Layers,
  LayoutGrid,
  Droplets,
  Package,
  Wrench,
} from "lucide-react";
import { HeroCarousel } from "./HeroCarousel";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { getCatalogProducts } from "@/lib/products";
import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { CHANNEL, getChannelResourceUrl } from "@/lib/channel";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { name: "Shower Doors", icon: DoorOpen, gradient: "from-navy to-navy-light" },
  { name: "Bathtubs", icon: Bath, gradient: "from-blue-600 to-blue-800" },
  { name: "Shower Bases", icon: Square, gradient: "from-amber-500 to-amber-700" },
  { name: "Shower Enclosures", icon: Layers, gradient: "from-emerald-600 to-emerald-800" },
  { name: "Showers", icon: Droplets, gradient: "from-cyan-500 to-cyan-700" },
  { name: "Wall", icon: LayoutGrid, gradient: "from-violet-600 to-violet-800" },
  { name: "Sinks", icon: Package, gradient: "from-slate-500 to-slate-700" },
  { name: "Fixtures", icon: Wrench, gradient: "from-rose-500 to-rose-700" },
];

/* ------------------------------------------------------------------ */
/*  HomeContent                                                        */
/* ------------------------------------------------------------------ */
export function HomeContent() {

  const catalogProducts = getCatalogProducts();

  // Featured: products with images + pricing, diverse across brands
  const featured = (() => {
    const candidates = catalogProducts
      .filter((p) => p.images.length > 0 && (p.pricing.basePrice || p.pricing.listPrice))
      .sort((a, b) => {
        const imgDiff = b.images.length - a.images.length;
        if (imgDiff !== 0) return imgDiff;
        return a.brand.localeCompare(b.brand);
      });

    const picked: typeof candidates = [];
    const usedBrands = new Set<string>();
    // First pass: one per brand
    for (const p of candidates) {
      if (picked.length >= 8) break;
      if (!usedBrands.has(p.brand)) {
        picked.push(p);
        usedBrands.add(p.brand);
      }
    }
    // Second pass: fill remaining slots
    for (const p of candidates) {
      if (picked.length >= 8) break;
      if (!picked.includes(p)) picked.push(p);
    }
    return picked;
  })();

  const brandCounts = new Map<string, number>();
  catalogProducts.forEach((p) => {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  });

  const categoryCounts = new Map<string, number>();
  catalogProducts.forEach((p) => {
    if (p.category) categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
  });

  const accentColor = CHANNEL.accentColor || "#f59e0b";

  return (
    <div>
      {/* ============================================================ */}
      {/*  HERO CAROUSEL                                               */}
      {/* ============================================================ */}
      <HeroCarousel />

      {/* ============================================================ */}
      {/*  BRAND LOGO BAR — frosted glass with warm bg                 */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-5">
          <div className="flex items-center sm:justify-center gap-6 sm:gap-8 md:gap-12 overflow-x-auto sm:flex-wrap scrollbar-hide">
            {BRAND_NAMES.map((name) => {
              const brand = BRANDS[name];
              if (!brand || !brand.logo) return null;
              return (
                <Link
                  key={name}
                  href={`/brands/${brand.slug}`}
                  className="opacity-40 hover:opacity-100 transition-all duration-300 shrink-0 hover:scale-105"
                  title={name}
                >
                  <Image
                    src={brand.logo}
                    alt={name}
                    width={80}
                    height={40}
                    className="h-7 md:h-9 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    unoptimized
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SHOP BY CATEGORY — Bento grid with varied sizes             */}
      {/* ============================================================ */}
      <section className="py-8 sm:py-10 md:py-20 bg-surface-sunken relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="mb-5 sm:mb-8 md:mb-12">
            <p className="text-label mb-3" style={{ color: accentColor }}>Browse catalog</p>
            <h2 className="text-2xl md:text-display-lg text-gray-900">
              Shop by Category
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {CATEGORIES.map(({ name, icon: Icon, gradient }, idx) => {
              const count = categoryCounts.get(name) || 0;
              return (
                <Link
                  key={name}
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-elevated"
                >
                  <div className={`bg-gradient-to-br ${gradient} p-4 sm:p-6 md:p-8 flex flex-col items-start relative`}>
                    {/* Decorative geometric accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-display font-bold text-white text-base md:text-lg leading-tight">
                        {name}
                      </h3>
                      {count > 0 && (
                        <p className="text-xs text-white/50 mt-2 font-medium">
                          {count} products
                        </p>
                      )}
                    </div>

                    {/* Hover gradient wash */}
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SHOP BY BRAND — asymmetric grid                             */}
      {/* ============================================================ */}
      <section className="py-10 md:py-20 bg-white relative">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="text-label mb-3" style={{ color: accentColor }}>Our manufacturers</p>
              <h2 className="text-2xl md:text-display-lg text-gray-900">
                Shop by Brand
              </h2>
            </div>
            <Link
              href="/brands"
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-navy hover:text-amber-dark transition-colors"
            >
              View All Brands
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 stagger-children">
            {BRAND_NAMES.map((name) => {
              const brand = BRANDS[name];
              if (!brand) return null;
              const count = brandCounts.get(name) || 0;
              return (
                <Link
                  key={name}
                  href={`/brands/${brand.slug}`}
                  className="group flex flex-col items-center p-4 sm:p-6 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-elevated transition-all duration-300 bg-white card-accent-top relative"
                >
                  {brand.logo ? (
                    <div className="w-16 h-16 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Image
                        src={brand.logo}
                        alt={name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain rounded-lg"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: brand.color }}
                    >
                      {name[0]}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-navy transition-colors font-display">
                    {name}
                  </span>
                  {count > 0 && (
                    <span className="text-xs text-gray-400 mt-1">
                      {count} products
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  FEATURED PRODUCTS                                           */}
      {/* ============================================================ */}
      {featured.length > 0 && (
        <section className="py-10 md:py-20 bg-surface-sunken relative">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 md:mb-10">
              <div>
                <p className="text-label mb-3" style={{ color: accentColor }}>Popular items</p>
                <h2 className="text-2xl md:text-display-lg text-gray-900">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-navy font-semibold text-sm hover:text-amber-dark transition-colors flex items-center gap-1.5"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 stagger-children">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  FEATURES ROW — editorial bento layout                      */}
      {/* ============================================================ */}
      <section className="py-10 md:py-20 bg-white relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 md:mb-14">
            <p className="text-label mb-3" style={{ color: accentColor }}>Why ABG Pro</p>
            <h2 className="text-2xl md:text-display-lg text-gray-900">
              Built for Sales Pros
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6 stagger-children">
            {[
              {
                icon: Search,
                title: "Instant Search",
                description:
                  "Find any product by name, SKU, brand, or description in milliseconds.",
                accentGradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: ShoppingCart,
                title: "Quick Quote Builder",
                description:
                  "Add products to your quote with one click. Submit directly to the ABG team.",
                accentGradient: "from-amber-500 to-orange-500",
              },
              {
                icon: MessageCircle,
                title: "AI Sales Assistant",
                description:
                  "Get product recommendations and answer customer questions with AI-powered chat.",
                accentGradient: "from-violet-500 to-purple-500",
              },
            ].map(({ icon: Icon, title, description, accentGradient }) => (
              <div
                key={title}
                className="group relative p-5 md:p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-elevated transition-all duration-300 border border-transparent hover:border-gray-200"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${accentGradient} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  QUICK RESOURCES                                             */}
      {/* ============================================================ */}
      <section className="py-10 md:py-20 bg-surface-sunken">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="mb-8 md:mb-12">
            <p className="text-label mb-3" style={{ color: accentColor }}>Documentation</p>
            <h2 className="text-2xl md:text-display-lg text-gray-900">
              Pro Resources
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {BRAND_NAMES
              .map((name) => {
                const brand = BRANDS[name];
                if (!brand) return null;
                const url = getChannelResourceUrl(name, brand.resourceUrl);
                if (!url) return null;
                const descMap: Record<string, string> = {
                  Aquatic: "Catalogs, install guides & spec sheets",
                  Bootz: "Professional resources & warranty info",
                  Dreamline: "Product catalog & resources",
                  MAAX: "Retail home center resources",
                  Swan: "Pro corner resources & documentation",
                  "Mr. Steam": "Residential guides & specifications",
                  "Coastal Shower Doors": "Product specs & install guides",
                  "American Standard": "Professional resources",
                  Clarion: "Catalogs & documentation",
                  Aker: "Accessible bathing resources",
                  Mansfield: "Fixtures documentation",
                };
                return { brand: name, url, desc: descMap[name] || "Product resources" };
              })
              .filter((x): x is { brand: string; url: string; desc: string } => x !== null)
              .slice(0, 6)
              .map(({ brand, url, desc }) => {
              const brandInfo = BRANDS[brand];
              return (
                <a
                  key={brand}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-5 bg-white rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-elevated transition-all duration-300"
                >
                  {brandInfo?.logo ? (
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 p-1 group-hover:bg-gray-100 transition-colors">
                      <Image
                        src={brandInfo.logo}
                        alt={brand}
                        width={32}
                        height={32}
                        className="w-full h-full object-contain"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: brandInfo?.color || "#152847" }}
                    >
                      {brand[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display font-bold text-gray-900 text-sm group-hover:text-navy transition-colors">
                      {brand}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </a>
              );
            })}
            <Link
              href="/resources"
              className="flex items-center justify-center gap-2 p-5 bg-navy/5 rounded-2xl border border-navy/10 hover:bg-navy/10 transition-all duration-300 text-navy font-semibold text-sm font-display"
            >
              View All Resources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA — dramatic with gradient                                */}
      {/* ============================================================ */}
      <section className="py-10 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="gradient-hero rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-16 text-center text-white relative overflow-hidden texture-noise">
            <div className="relative z-10">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ backgroundColor: accentColor + "25" }}
              >
                <Shield className="w-8 h-8" style={{ color: accentColor }} />
              </div>
              <h2 className="text-2xl md:text-display-lg text-white mb-4">Ready to Build a Quote?</h2>
              <p className="text-white/80 mb-10 max-w-lg mx-auto leading-relaxed">
                Add products to your cart and submit a quote request. Our team
                responds within one business day.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/products">
                  <Button variant="amber" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    Start Browsing
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/resources">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border border-white/30 text-white hover:bg-white/10 hover:border-white/40"
                  >
                    Pro Resources
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-1/3 -translate-x-1/3" />
          </div>
        </div>
      </section>
    </div>
  );
}

