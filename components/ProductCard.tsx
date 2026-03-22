"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus, Accessibility } from "lucide-react";
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
      className="inline-flex items-center justify-center rounded text-[11px] font-bold text-white select-none"
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
          "group flex items-center gap-5 p-4 bg-surface rounded-lg border border-border-subtle",
          "hover:shadow-card-hover hover:border-navy/20",
          "transition-all duration-200 ease-out"
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-28 h-[84px] bg-surface-sunken rounded-lg overflow-hidden flex-shrink-0">
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
              <Badge variant="secondary" className="text-xs">
                {product.category}
              </Badge>
            )}
            {variantCount > 0 && (
              <Badge variant="outline" className="gap-0.5 border-purple-300 bg-purple-50 text-purple-700 text-xs leading-none">
                {variantCount} options
              </Badge>
            )}
            {isAda && (
              <Badge
                variant="outline"
                className="gap-1 border-blue-300 bg-blue-50 text-blue-700 text-xs leading-none"
              >
                <Accessibility className="w-3 h-3" />
                ADA
              </Badge>
            )}
          </div>

          {/* Name */}
          <h3 className="font-medium text-text-primary text-sm leading-snug line-clamp-1 group-hover:text-navy transition-colors">
            {displayName}
          </h3>

          {/* SKU + finish */}
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-text-tertiary font-sku">
              SKU: {product.sku}
            </p>
            {finish && (
              <p className="text-xs text-text-secondary">
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
  /*  GRID VIEW (default) — simplified                                        */
  /* ======================================================================== */
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group flex flex-col bg-surface rounded-lg border border-border-subtle overflow-hidden",
        "hover:shadow-lg hover:border-navy/20",
        "transition-all duration-200 ease-out"
      )}
    >
      {/* Product image — taller, cleaner */}
      <div className="relative aspect-[3/4] bg-surface-sunken overflow-hidden">
        {product.images[0] ? (
          <>
            <Image
              src={product.images[0]}
              alt={displayName}
              fill
              className={cn(
                "object-contain p-6",
                "transition-transform duration-300 ease-out",
                "group-hover:scale-105"
              )}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
            {/* Hover image swap if second image exists */}
            {product.images[1] && (
              <Image
                src={product.images[1]}
                alt={`${displayName} alternate view`}
                fill
                className="object-contain p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized
              />
            )}
          </>
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
      </div>

      {/* Info — minimal */}
      <div className="p-4 flex flex-col gap-1.5">
        <p className="text-xs text-text-tertiary">{product.brand}</p>
        <h3 className="text-sm font-medium text-text-primary line-clamp-2 leading-snug">
          {displayName}
        </h3>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-subtle">
          {hasPrice ? (
            <p className="font-bold text-navy">{formatPrice(price)}</p>
          ) : (
            <p className="text-sm font-medium text-amber-dark">Quote</p>
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
