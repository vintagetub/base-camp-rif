"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { getProductsByBrand } from "@/lib/products";
import { CHANNEL } from "@/lib/channel";
import { Button } from "./ui/button";

export function BrandsOverview() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Our Brands</h1>
        <p className="text-gray-500 mt-2">
          {CHANNEL.id !== "all"
            ? `Bath product brands available at ${CHANNEL.name}`
            : "American Bath Group represents leading manufacturers in the bath industry"}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {BRAND_NAMES.map((name) => {
          const brand = BRANDS[name];
          if (!brand) return null;
          const products = getProductsByBrand(name);

          return (
            <div
              key={name}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
            >
              <div
                className="h-32 flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${brand.color}15, ${brand.color}30)`,
                }}
              >
                {brand.logo ? (
                  <div className="relative group-hover:scale-105 transition-transform duration-300">
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
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: brand.color }}
                  >
                    {name[0]}
                  </div>
                )}
                {/* Product count badge */}
                <span
                  className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: brand.color }}
                >
                  {products.length}
                </span>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {name}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  {products.length} products
                </p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {brand.description}
                </p>
                <div className="flex gap-2">
                  <Link href={`/brands/${brand.slug}`} className="flex-1">
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full group/btn"
                    >
                      View Products
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  {brand.website && brand.website !== "#" && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
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
