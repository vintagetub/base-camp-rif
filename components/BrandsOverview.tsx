"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { getProductsByBrand } from "@/lib/products";
import { CHANNEL } from "@/lib/channel";
import { Button } from "./ui/button";

export function BrandsOverview() {
  const accentColor = CHANNEL.accentColor || "#f59e0b";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <p className="text-label mb-3" style={{ color: accentColor }}>Manufacturers</p>
        <h1 className="text-display-lg text-gray-900">Our Brands</h1>
        <p className="text-gray-500 mt-3 max-w-xl leading-relaxed">
          {CHANNEL.id !== "all"
            ? `Bath product brands available at ${CHANNEL.name}`
            : "American Bath Group represents leading manufacturers in the bath industry"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {BRAND_NAMES.map((name) => {
          const brand = BRANDS[name];
          if (!brand) return null;
          const products = getProductsByBrand(name);

          return (
            <div
              key={name}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-elevated hover:border-transparent transition-all duration-300 group card-accent-top"
            >
              <div
                className="h-36 flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${brand.color}08, ${brand.color}18)`,
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ backgroundColor: brand.color + "08" }} />
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full" style={{ backgroundColor: brand.color + "06" }} />

                {brand.logo ? (
                  <div className="relative group-hover:scale-105 transition-transform duration-300 z-10">
                    <Image
                      src={brand.logo}
                      alt={name}
                      width={160}
                      height={80}
                      className="h-16 w-auto object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl group-hover:scale-110 transition-transform duration-300 z-10"
                    style={{ backgroundColor: brand.color }}
                  >
                    {name[0]}
                  </div>
                )}
                {/* Product count badge */}
                <span
                  className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white z-10"
                  style={{ backgroundColor: brand.color }}
                >
                  {products.length}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-display font-bold text-gray-900 mb-1">
                  {name}
                </h2>
                <p className="text-sm text-gray-400 mb-3 font-medium">
                  {products.length} products
                </p>
                <p className="text-sm text-gray-600 mb-5 line-clamp-3 leading-relaxed">
                  {brand.description}
                </p>
                <div className="flex gap-2">
                  <Link href={`/brands/${brand.slug}`} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full rounded-xl group/btn"
                    >
                      View Products
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                  {brand.website && brand.website !== "#" && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
