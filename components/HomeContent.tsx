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
} from "lucide-react";
import { HeroCarousel } from "./HeroCarousel";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { getCatalogProducts } from "@/lib/products";
import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { CHANNEL, getChannelResourceUrl } from "@/lib/channel";

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { name: "Bathtubs", icon: Bath, gradient: "from-blue-500 to-blue-700" },
  { name: "Shower Doors", icon: DoorOpen, gradient: "from-navy to-navy-light" },
  { name: "Shower Bases", icon: Square, gradient: "from-amber-500 to-amber-600" },
  { name: "Shower Doors & Enclosures", icon: Layers, gradient: "from-emerald-500 to-emerald-700" },
  { name: "Wall Systems", icon: LayoutGrid, gradient: "from-purple-500 to-purple-700" },
];

/* ------------------------------------------------------------------ */
/*  HomeContent                                                        */
/* ------------------------------------------------------------------ */
export function HomeContent() {

  const catalogProducts = getCatalogProducts(); // Parents + standalones
  const featured = catalogProducts
    .filter((p) => p.images.length > 0 && (p.pricing.basePrice || p.pricing.listPrice))
    .slice(0, 8);

  // Brand product counts (based on catalog products — parents + standalones)
  const brandCounts = new Map<string, number>();
  catalogProducts.forEach((p) => {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  });

  // Category product counts (based on catalog products)
  const categoryCounts = new Map<string, number>();
  catalogProducts.forEach((p) => {
    if (p.category) categoryCounts.set(p.category, (categoryCounts.get(p.category) || 0) + 1);
  });

  return (
    <div>
      {/* ============================================================ */}
      {/*  HERO CAROUSEL                                               */}
      {/* ============================================================ */}
      <HeroCarousel />

      {/* ============================================================ */}
      {/*  BRAND LOGO BAR                                              */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
            {BRAND_NAMES.map((name) => {
              const brand = BRANDS[name];
              if (!brand || !brand.logo) return null;
              return (
                <Link
                  key={name}
                  href={`/brands/${brand.slug}`}
                  className="opacity-60 hover:opacity-100 transition-opacity shrink-0"
                  title={name}
                >
                  <Image
                    src={brand.logo}
                    alt={name}
                    width={80}
                    height={40}
                    className="h-8 md:h-10 w-auto object-contain"
                    unoptimized
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SHOP BY CATEGORY                                            */}
      {/* ============================================================ */}
      <section className="py-16 bg-surface-sunken">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Shop by Category
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Browse our full catalog organized by product type
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map(({ name, icon: Icon, gradient }) => {
              const count = categoryCounts.get(name) || 0;
              return (
                <Link
                  key={name}
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-transparent hover:shadow-xl transition-all"
                >
                  <div className={`bg-gradient-to-br ${gradient} p-6 md:p-8 flex flex-col items-center text-center`}>
                    <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-white text-sm md:text-base leading-tight">
                      {name}
                    </h3>
                    {count > 0 && (
                      <p className="text-xs text-white/60 mt-2">
                        {count} products
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SHOP BY BRAND                                               */}
      {/* ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Shop by Brand
            </h2>
            <p className="text-gray-500">
              Trusted manufacturers in the bath industry
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {BRAND_NAMES.map((name) => {
              const brand = BRANDS[name];
              if (!brand) return null;
              const count = brandCounts.get(name) || 0;
              return (
                <Link
                  key={name}
                  href={`/brands/${brand.slug}`}
                  className="group flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-navy/30 hover:shadow-lg transition-all bg-white"
                >
                  {brand.logo ? (
                    <div className="w-16 h-16 mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
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
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: brand.color }}
                    >
                      {name[0]}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 group-hover:text-navy transition-colors">
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
        <section className="py-16 bg-surface-sunken">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Featured Products
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Popular items from our catalog
                </p>
              </div>
              <Link
                href="/products"
                className="text-navy font-medium text-sm hover:text-amber-dark transition-colors flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/*  FEATURES ROW                                                */}
      {/* ============================================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Instant Search",
                description:
                  "Find any product by name, SKU, brand, or description in milliseconds.",
              },
              {
                icon: ShoppingCart,
                title: "Quick Quote Builder",
                description:
                  "Add products to your quote with one click. Submit directly to the ABG team.",
              },
              {
                icon: MessageCircle,
                title: "AI Sales Assistant",
                description:
                  "Get product recommendations and answer customer questions with AI-powered chat.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  QUICK RESOURCES                                             */}
      {/* ============================================================ */}
      <section className="py-16 bg-surface-sunken">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pro Resources
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Quick access to brand resources, training, and documentation
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="group flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-navy/30 hover:shadow-lg transition-all"
                >
                  {brandInfo?.logo ? (
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 p-1">
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
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                      style={{ backgroundColor: brandInfo?.color || "#1a2744" }}
                    >
                      {brand[0]}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm group-hover:text-navy transition-colors">
                      {brand}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </a>
              );
            })}
            <Link
              href="/resources"
              className="flex items-center justify-center gap-2 p-4 bg-navy/5 rounded-xl border border-navy/10 hover:bg-navy/10 transition-colors text-navy font-semibold text-sm"
            >
              View All Resources
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="bg-navy rounded-3xl p-8 md:p-12 text-center text-white">
            <Shield className="w-12 h-12 text-amber mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-3">Ready to Build a Quote?</h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Add products to your cart and submit a quote request. Our team
              responds within one business day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/products">
                <Button variant="amber" size="lg">
                  Start Browsing
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/resources">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Pro Resources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
