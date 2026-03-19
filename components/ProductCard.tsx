"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Eye, Accessibility } from "lucide-react";
import { type Product } from "@/lib/products";
import { formatPrice, cn } from "@/lib/utils";
import { useQuoteStore } from "@/lib/store";
import { getBrandInfo } from "@/lib/brands";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
}

/* -------------------------------------------------------------------------- */
/*  Brand Logo / Fallback Initial                                             */
/* -------------------------------------------------------------------------- */
function BrandLogo({
  logo,
  brandName,
  brandColor,
  size = 24,
}: {
  logo: string;
  brandName: string;
  brandColor: string;
  size?: number;
}) {
  if (logo) {
    return (
      <Image
        src={logo}
        alt={brandName}
        width={size}
        height={size}
        className="object-contain"
        style={{ height: size, width: "auto" }}
        unoptimized
      />
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center rounded-md text-[11px] font-bold text-white select-none"
      style={{
        backgroundColor: brandColor,
        width: size,
        height: size,
      }}
    >
      {brandName[0]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  ADA Badge                                                                 */
/* -------------------------------------------------------------------------- */
function AdaBadge() {
  return (
    <Badge
      variant="outline"
      className="gap-1 border-blue-300 bg-blue-50 text-blue-700 text-[10px] leading-none"
    >
      <Accessibility className="w-3 h-3" />
      ADA
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Card Component                                                       */
/* -------------------------------------------------------------------------- */
export function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const addItem = useQuoteStore((s) => s.addItem);
  const brandInfo = getBrandInfo(product.brand);

  const price =
    product.pricing.basePrice ||
    product.pricing.listPrice ||
    product.pricing.msrp;
  const hasPrice = !!price;

  const isAda = product.specifications?.ada === "Yes";
  const finish = product.specifications?.finish;
  const displayName = product.shortName || product.name;
  const variantCount = product.childVariantIds?.length || 0;

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      sku: product.sku,
      name: displayName,
      brand: product.brand,
      image: product.images[0] || "",
      price: product.pricing.basePrice || product.pricing.listPrice || "",
    });
  };

  /* ======================================================================== */
  /*  LIST VIEW                                                               */
  /* ======================================================================== */
  if (view === "list") {
    return (
      <Link
        href={`/products/${product.id}`}
        className={cn(
          "group flex items-center gap-5 p-4 bg-white rounded-xl border border-gray-200",
          "hover:shadow-card-hover hover:border-navy/30",
          "transition-all duration-200 ease-out",
          "hover:-translate-y-0.5"
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-28 h-[84px] bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={displayName}
              fill
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
              sizes="112px"
              unoptimized
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: brandInfo.color }}
            >
              {product.brand[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top meta row */}
          <div className="flex items-center gap-2 mb-1.5">
            <BrandLogo
              logo={brandInfo.logo}
              brandName={brandInfo.name}
              brandColor={brandInfo.color}
              size={20}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: brandInfo.color }}
            >
              {product.brand}
            </span>
            {product.category && product.category !== "Uncategorized" && (
              <Badge variant="secondary" className="text-[10px]">
                {product.category}
              </Badge>
            )}
            {variantCount > 0 && (
              <Badge variant="outline" className="gap-0.5 border-purple-300 bg-purple-50 text-purple-700 text-[10px] leading-none">
                {variantCount} options
              </Badge>
            )}
            {isAda && <AdaBadge />}
          </div>

          {/* Name */}
          <h3 className="font-medium text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-navy transition-colors">
            {displayName}
          </h3>

          {/* SKU + finish */}
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-400 font-sku">
              SKU: {product.sku}
            </p>
            {finish && (
              <p className="text-xs text-gray-500">
                Finish: <span className="font-medium">{finish}</span>
              </p>
            )}
          </div>
        </div>

        {/* Price + Action */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            {hasPrice ? (
              <p className="text-lg font-bold text-navy">
                {formatPrice(price)}
              </p>
            ) : (
              <p className="text-sm font-medium text-amber-dark">
                Request Quote
              </p>
            )}
          </div>
          <Button size="sm" variant="amber" onClick={handleAddToQuote}>
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </Link>
    );
  }

  /* ======================================================================== */
  /*  GRID VIEW (default)                                                     */
  /* ======================================================================== */
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden",
        "shadow-card",
        "hover:shadow-card-hover hover:border-navy/30",
        "hover:-translate-y-[2px]",
        "transition-all duration-200 ease-out"
      )}
    >
      {/* ------------------------------------------------------------------ */}
      {/*  Top bar: brand logo + ADA badge                                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BrandLogo
            logo={brandInfo.logo}
            brandName={brandInfo.name}
            brandColor={brandInfo.color}
            size={24}
          />
          <span
            className="text-xs font-semibold truncate max-w-[100px]"
            style={{ color: brandInfo.color }}
          >
            {product.brand}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {variantCount > 0 && (
            <Badge
              variant="outline"
              className="gap-0.5 border-purple-300 bg-purple-50 text-purple-700 text-[10px] leading-none"
            >
              {variantCount} options
            </Badge>
          )}
          {isAda && <AdaBadge />}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Product image (4:3 aspect ratio, zoom on hover)                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={displayName}
            fill
            className={cn(
              "object-contain p-4",
              "transition-transform duration-200 ease-out",
              "group-hover:scale-105"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center"
            style={{ backgroundColor: brandInfo.color + "12" }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
              style={{ backgroundColor: brandInfo.color }}
            >
              {product.brand[0]}
            </div>
            <span
              className="text-xs font-medium mt-2"
              style={{ color: brandInfo.color }}
            >
              {product.brand}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/5 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium text-navy flex items-center gap-1 shadow">
            <Eye className="w-3.5 h-3.5" />
            View Details
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Info section                                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col flex-1 px-3 pt-3 pb-3">
        {/* Category pill */}
        {product.category && product.category !== "Uncategorized" && (
          <Badge variant="secondary" className="self-start text-[10px] mb-1.5">
            {product.category}
          </Badge>
        )}

        {/* Product name (2 line max) */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-navy transition-colors mb-auto">
          {displayName}
        </h3>

        {/* Finish info */}
        {finish && (
          <p className="text-[11px] text-gray-500 mt-1.5">
            Finish:{" "}
            <span className="font-medium text-gray-700">{finish}</span>
          </p>
        )}

        {/* SKU */}
        <p className="text-xs text-gray-400 font-sku mt-1">
          {product.sku}
        </p>

        {/* Price + Add to Quote row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {hasPrice ? (
            <div>
              <p className="text-lg font-bold text-navy leading-tight">
                {formatPrice(price)}
              </p>
              {product.pricing.msrp &&
                product.pricing.msrp !== price && (
                  <p className="text-[10px] text-gray-400 line-through">
                    MSRP {formatPrice(product.pricing.msrp)}
                  </p>
                )}
            </div>
          ) : (
            <p className="text-sm font-medium text-amber-dark">
              Request Quote
            </p>
          )}
          <Button
            size="sm"
            variant="amber"
            onClick={handleAddToQuote}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
