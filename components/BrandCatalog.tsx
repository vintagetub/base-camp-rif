"use client";

import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Home, ChevronRight } from "lucide-react";
import { getBrandBySlug } from "@/lib/brands";
import { getProductsByBrand } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";

interface BrandCatalogProps {
  brandSlug: string;
}

export function BrandCatalog({ brandSlug }: BrandCatalogProps) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return null;

  const products = getProductsByBrand(brand.name);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-navy">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/brands" className="hover:text-navy">
          Brands
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700">{brand.name}</span>
      </nav>

      {/* Brand hero */}
      <div
        className="rounded-2xl p-8 md:p-12 mb-8"
        style={{
          background: `linear-gradient(135deg, ${brand.color}10, ${brand.color}25)`,
        }}
      >
        <div className="flex items-start gap-6">
          {brand.logo ? (
            <div
              className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 bg-white p-2 border"
              style={{ borderColor: brand.color + "30" }}
            >
              <Image
                src={brand.logo}
                alt={brand.name}
                width={72}
                height={72}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shrink-0"
              style={{ backgroundColor: brand.color }}
            >
              {brand.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {brand.name}
            </h1>
            <p className="text-gray-600 mb-4 max-w-2xl">{brand.description}</p>
            <div className="flex flex-wrap gap-3">
              {brand.website && brand.website !== "#" && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="w-4 h-4" />
                    Visit Website
                  </Button>
                </a>
              )}
              {brand.resourceUrl && (
                <a
                  href={brand.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    Pro Resources
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-900">{products.length}</span>{" "}
          products
        </p>
      </div>

      {/* Product grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">No products found for this brand.</p>
        </div>
      )}
    </div>
  );
}
