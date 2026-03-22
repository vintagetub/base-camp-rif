"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Bath,
  DoorOpen,
  Square,
  Layers,
  LayoutGrid,
  Award,
  Truck,
  HeadphonesIcon,
} from "lucide-react";
import { HeroCarousel } from "./HeroCarousel";
import { Section } from "./Section";
import { Button } from "./ui/button";
import { ProductCard } from "./ProductCard";
import { getCatalogProducts } from "@/lib/products";
import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { CHANNEL, getChannelResourceUrl } from "@/lib/channel";

/* ------------------------------------------------------------------ */
/*  Category config                                                    */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { name: "Bathtubs", icon: Bath },
  { name: "Shower Doors", icon: DoorOpen },
  { name: "Shower Bases", icon: Square },
  { name: "Shower Doors & Enclosures", icon: Layers },
  { name: "Wall Systems", icon: LayoutGrid },
];

/* ------------------------------------------------------------------ */
/*  HomeContent                                                        */
/* ------------------------------------------------------------------ */
export function HomeContent() {

  const catalogProducts = getCatalogProducts();
  const featured = catalogProducts
    .filter((p) => p.images.length > 0 && (p.pricing.basePrice || p.pricing.listPrice))
    .slice(0, 8);

  const brandCounts = new Map<string, number>();
  catalogProducts.forEach((p) => {
    brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  });

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
      <Section spacing="xs" background="default" className="border-b border-border-subtle">
        <div className="flex items-center justify-center gap-6 md:gap-10 flex-wrap">
          {BRAND_NAMES.map((name) => {
            const brand = BRANDS[name];
            if (!brand || !brand.logo) return null;
            return (
              <Link
                key={name}
                href={`/brands/${brand.slug}`}
                className="opacity-70 hover:opacity-100 transition-opacity shrink-0"
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
      </Section>

      {/* ============================================================ */}
      {/*  SHOP BY CATEGORY                                            */}
      {/* ============================================================ */}
      <Section spacing="md" background="sunken">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Shop by Category
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Browse our full catalog organized by product type
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map(({ name, icon: Icon }) => {
            const count = categoryCounts.get(name) || 0;
            return (
              <Link
                key={name}
                href={`/products?category=${encodeURIComponent(name)}`}
                className="group flex flex-col items-center text-center p-5 md:p-6 rounded-lg bg-surface border border-border-subtle hover:border-navy/20 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-navy/10 flex items-center justify-center mb-3 group-hover:bg-navy/15 group-hover:scale-110 transition-all">
                  <Icon className="w-6 h-6 text-navy" />
                </div>
                <h3 className="font-semibold text-text-primary text-sm leading-tight">
                  {name}
                </h3>
                {count > 0 && (
                  <p className="text-xs text-text-tertiary mt-1.5">
                    {count} products
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  SHOP BY BRAND                                               */}
      {/* ============================================================ */}
      <Section spacing="md" background="default">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Shop by Brand
          </h2>
          <p className="text-text-secondary">
            Trusted manufacturers in the bath industry
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {BRAND_NAMES.map((name) => {
            const brand = BRANDS[name];
            if (!brand) return null;
            const count = brandCounts.get(name) || 0;
            return (
              <Link
                key={name}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center p-5 rounded-lg border border-border-subtle hover:border-navy/20 hover:shadow-lg transition-all bg-surface"
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
                <span className="text-sm font-medium text-text-secondary group-hover:text-navy transition-colors">
                  {name}
                </span>
                {count > 0 && (
                  <span className="text-xs text-text-tertiary mt-1">
                    {count} products
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  FEATURED PRODUCTS                                           */}
      {/* ============================================================ */}
      {featured.length > 0 && (
        <Section spacing="md" background="sunken">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary">
                Featured Products
              </h2>
              <p className="text-text-secondary text-sm mt-1">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </Section>
      )}

      {/* ============================================================ */}
      {/*  VALUE PROPOSITIONS (replaces Features Row)                   */}
      {/* ============================================================ */}
      <Section spacing="sm" background="default">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Award,
              title: "Premium Quality",
              description:
                "Backed by American Bath Group's portfolio of trusted brands, each product meets rigorous quality standards.",
            },
            {
              icon: Truck,
              title: "Fast Fulfillment",
              description:
                "Reliable supply chain with warehouses across the US and Canada for quick delivery to your jobsite.",
            },
            {
              icon: HeadphonesIcon,
              title: "Dedicated Support",
              description:
                "Our pro sales team provides expert guidance, volume pricing, and responsive quote turnaround.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 rounded-lg bg-surface-sunken"
            >
              <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-navy" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-1">{title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  QUICK RESOURCES                                             */}
      {/* ============================================================ */}
      <Section spacing="md" background="sunken">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-primary mb-3">
            Pro Resources
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Quick access to brand resources, training, and documentation
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                className="group flex items-start gap-3 p-4 bg-surface rounded-lg border border-border-subtle hover:border-navy/20 hover:shadow-lg transition-all"
              >
                {brandInfo?.logo ? (
                  <div className="w-10 h-10 rounded-lg bg-surface-sunken flex items-center justify-center shrink-0 p-1">
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
                  <p className="font-semibold text-text-primary text-sm group-hover:text-navy transition-colors">
                    {brand}
                  </p>
                  <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                </div>
              </a>
            );
          })}
          <Link
            href="/resources"
            className="flex items-center justify-center gap-2 p-4 bg-navy/5 rounded-lg border border-navy/10 hover:bg-navy/10 transition-colors text-navy font-semibold text-sm"
          >
            View All Resources
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  CTA                                                         */}
      {/* ============================================================ */}
      <Section spacing="lg">
        <div className="bg-navy rounded-xl p-8 md:p-12 text-center text-white">
          <Shield className="w-12 h-12 text-amber mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Build a Quote?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
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
      </Section>
    </div>
  );
}
