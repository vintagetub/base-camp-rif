"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Minus,
  ShoppingCart,
  ExternalLink,
  Tag,
  Ruler,
  Barcode,
  Home,
  ChevronRight,
  ChevronDown,
  FileText,
  Play,
  Video,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Store,
  Package,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  type Product,
  getRelatedProducts,
  getDescription,
  getVariantMatrix,
  getProductById,
} from "@/lib/products";
import { getCompatibleProducts } from "@/lib/compatibility";
import { useQuoteStore } from "@/lib/store";
import { formatPrice, cn } from "@/lib/utils";
import { getBrandInfo } from "@/lib/brands";
import { ImageGallery } from "./ImageGallery";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductDetailProps {
  product: Product;
}

type TabId = "overview" | "specifications" | "resources" | "compatible" | "related";

interface TabDef {
  id: TabId;
  label: string;
  available: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pretty-print a spec key for display */
function formatSpecLabel(key: string): string {
  return key
    .replace(/\(in\.\)/g, "(in.)")
    .split(" ")
    .map((w) => (w === "ada" ? "ADA" : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/** Extract a YouTube embed URL from a standard or shortened link */
function youtubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
    } else if (u.hostname.includes("youtu.be")) {
      videoId = u.pathname.slice(1);
    }
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    // not a valid URL
  }
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProductDetail({ product }: ProductDetailProps) {
  // -- state ----------------------------------------------------------------
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isSticky, setIsSticky] = useState(false);

  // -- variant state --------------------------------------------------------
  const variantMatrix = useMemo(
    () => (product.isParent ? getVariantMatrix(product.id) : null),
    [product.id, product.isParent]
  );
  const hasVariants = !!(variantMatrix && variantMatrix.variants.length > 0);

  // Initialize selected attributes — defaults to first variant
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    if (!variantMatrix || !hasVariants) return {};
    const firstVariant = variantMatrix.variants[0];
    return firstVariant?.variantAttributes ? { ...firstVariant.variantAttributes } : {};
  });

  // On mount, check URL for ?variant= param and pre-select that variant (client-side only)
  useEffect(() => {
    if (!variantMatrix || !hasVariants) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const variantId = params.get("variant");
      if (variantId) {
        const requestedVariant = variantMatrix.variants.find(v => v.id === variantId);
        if (requestedVariant?.variantAttributes) {
          setSelectedAttributes({ ...requestedVariant.variantAttributes });
        }
      }
    } catch {
      // SSR or window not available — ignore
    }
  }, [variantMatrix, hasVariants]);

  // Find the selected child variant
  const selectedVariant = useMemo(() => {
    if (!hasVariants || !variantMatrix) return null;
    return variantMatrix.variants.find((v) => {
      const attrs = v.variantAttributes || {};
      return variantMatrix.dimensions.every(
        (dim) => attrs[dim] === selectedAttributes[dim]
      );
    }) || null;
  }, [hasVariants, variantMatrix, selectedAttributes]);

  // The "active" product for display (selected variant or the product itself)
  const activeProduct = selectedVariant || product;

  const handleAttributeChange = useCallback((dimension: string, value: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [dimension]: value }));
  }, []);

  // -- refs -----------------------------------------------------------------
  const tabBarRef = useRef<HTMLDivElement>(null);
  const heroSentinelRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<TabId, HTMLElement | null>>({
    overview: null,
    specifications: null,
    resources: null,
    compatible: null,
    related: null,
  });

  // -- store ----------------------------------------------------------------
  const addItem = useQuoteStore((s) => s.addItem);
  const addRecentlyViewed = useQuoteStore((s) => s.addRecentlyViewed);

  // -- derived data ---------------------------------------------------------
  const brandInfo = getBrandInfo(product.brand);
  const related = getRelatedProducts(product);
  const compatibleGroups = useMemo(() => getCompatibleProducts(product), [product]);
  const description = getDescription(product);

  // Use activeProduct for price and display, but fall back to parent data
  const price =
    activeProduct.pricing.basePrice || activeProduct.pricing.listPrice || activeProduct.pricing.msrp ||
    product.pricing.basePrice || product.pricing.listPrice || product.pricing.msrp;
  const hasPrice = !!price;

  const isAda = (activeProduct.specifications?.ada || product.specifications?.ada) === "Yes";
  const hasProp65 = (activeProduct.specifications?.["prop 65"] || product.specifications?.["prop 65"]) === "Yes";

  // Build the spec entries that actually have data
  const specEntries = useMemo(() => {
    const entries: { label: string; value: string }[] = [];

    // Core product fields first
    if (product.color) entries.push({ label: "Color", value: product.color });
    if (product.installationType)
      entries.push({ label: "Installation Type", value: product.installationType });
    if (product.productType)
      entries.push({ label: "Product Type", value: product.productType });
    if (product.collection)
      entries.push({ label: "Collection", value: product.collection });

    // v2 specification fields
    if (product.specifications) {
      const skipKeys = new Set(["ada", "prop 65"]);
      Object.entries(product.specifications).forEach(([key, val]) => {
        if (!val || skipKeys.has(key)) return;
        // Avoid duplicating fields we already added from core
        const label = formatSpecLabel(key);
        if (
          entries.some(
            (e) => e.label.toLowerCase() === label.toLowerCase()
          )
        )
          return;
        entries.push({ label, value: val });
      });
    }

    return entries;
  }, [product]);

  // Warranty entries
  const warrantyEntries = useMemo(() => {
    const entries: { label: string; value: string }[] = [];
    if (product.specifications?.["residential warranty"])
      entries.push({
        label: "Residential Warranty",
        value: product.specifications["residential warranty"],
      });
    if (product.specifications?.["commercial warranty"])
      entries.push({
        label: "Commercial Warranty",
        value: product.specifications["commercial warranty"],
      });
    return entries;
  }, [product.specifications]);

  // Videos
  const videoList = useMemo(() => {
    const list: { label: string; url: string }[] = [];
    if (product.videos) {
      if (product.videos["installation video"])
        list.push({ label: "Installation Video", url: product.videos["installation video"] });
      if (product.videos["brand video"])
        list.push({ label: "Brand Video", url: product.videos["brand video"] });
    }
    return list;
  }, [product.videos]);

  // Resources
  const resourceList = useMemo(() => {
    const list: { label: string; url: string; icon: typeof FileText }[] = [];
    if (product.resources?.["Warranty Sheet - en-US"])
      list.push({
        label: "Warranty Sheet",
        url: product.resources["Warranty Sheet - en-US"],
        icon: ShieldCheck,
      });
    if (product.resources?.["Use and Care"])
      list.push({
        label: "Use and Care Guide",
        url: product.resources["Use and Care"],
        icon: FileText,
      });
    return list;
  }, [product.resources]);

  const hasResources =
    resourceList.length > 0 ||
    videoList.length > 0 ||
    !!product.retailLinks?.homeDepotUrl;

  // Tabs
  const tabs: TabDef[] = useMemo(
    () => [
      { id: "overview", label: "Overview", available: true },
      {
        id: "specifications",
        label: "Specifications",
        available: specEntries.length > 0 || warrantyEntries.length > 0,
      },
      { id: "resources", label: "Resources", available: hasResources },
      { id: "compatible", label: "Compatible", available: compatibleGroups.length > 0 },
      { id: "related", label: "Related", available: related.length > 0 },
    ],
    [specEntries, warrantyEntries, hasResources, compatibleGroups, related]
  );

  // -- effects --------------------------------------------------------------

  // Track recently viewed
  useEffect(() => {
    addRecentlyViewed(product.id);
  }, [product.id, addRecentlyViewed]);

  // Sticky tab bar via IntersectionObserver
  useEffect(() => {
    const sentinel = heroSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // -- handlers -------------------------------------------------------------

  const handleAddToQuote = () => {
    // Use the selected variant if available, otherwise use the main product
    const itemToAdd = selectedVariant || product;
    const variantDesc = selectedVariant?.variantAttributes
      ? Object.values(selectedVariant.variantAttributes).join(", ")
      : undefined;

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: itemToAdd.id,
        sku: itemToAdd.sku,
        name: product.shortName || product.name, // Use parent name for clarity
        brand: itemToAdd.brand || product.brand,
        image: itemToAdd.images?.[0] || product.images[0] || "",
        price: itemToAdd.pricing.basePrice || itemToAdd.pricing.listPrice || product.pricing.basePrice || product.pricing.listPrice || "",
        parentId: selectedVariant ? product.id : undefined,
        variantDescription: variantDesc,
      });
    }
  };

  const scrollToTab = (tabId: TabId) => {
    setActiveTab(tabId);
    const el = sectionRefs.current[tabId];
    if (el) {
      const yOffset = -80; // account for sticky tab bar height
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // -- render ---------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ===================== Breadcrumb ===================== */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-navy transition-colors">
          <Home className="w-4 h-4" />
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/products" className="hover:text-navy transition-colors">
          Products
        </Link>
        {product.brand && product.brand !== "Other" && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/brands/${brandInfo.slug}`}
              className="hover:text-navy transition-colors"
            >
              {product.brand}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 truncate max-w-xs">
          {product.shortName || product.name}
        </span>
      </nav>

      {/* ===================== Hero Section ===================== */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Gallery + video embed */}
        <div className="space-y-6">
          <ImageGallery
            images={product.images}
            brand={product.brand}
            productName={product.shortName || product.name}
          />

          {/* Video embed below gallery */}
          {videoList.length > 0 && (() => {
            const embedUrl = youtubeEmbedUrl(videoList[0].url);
            if (!embedUrl) return null;
            return (
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-card">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={embedUrl}
                    title={videoList[0].label}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  {videoList[0].label}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Right: Product info */}
        <div>
          {/* Brand badge with logo */}
          <div className="flex items-center gap-3 mb-4">
            {brandInfo.logo ? (
              <div className="h-8 w-auto relative">
                <Image
                  src={brandInfo.logo}
                  alt={brandInfo.name}
                  width={80}
                  height={32}
                  className="h-8 w-auto object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <Badge
                className="text-white"
                style={{ backgroundColor: brandInfo.color }}
              >
                {product.brand}
              </Badge>
            )}
            {product.category && product.category !== "Uncategorized" && (
              <Badge variant="secondary">{product.category}</Badge>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-navy-800 leading-tight mb-2">
            {product.name || product.shortName}
          </h1>

          {/* SKU / UPC / Collection — shows active variant info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-4">
            <span className="font-sku">SKU: {activeProduct.sku}</span>
            {activeProduct.upc && (
              <span className="font-sku flex items-center gap-1">
                <Barcode className="w-3.5 h-3.5" />
                UPC: {activeProduct.upc}
              </span>
            )}
            {product.collection && (
              <span>Collection: {product.collection}</span>
            )}
          </div>

          {/* ===================== Variant Selector ===================== */}
          {hasVariants && variantMatrix && (
            <div className="mb-5 space-y-3">
              {variantMatrix.dimensions.map((dimension) => {
                const options = variantMatrix.options[dimension] || [];
                if (options.length === 0) return null;
                return (
                  <div key={dimension}>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      {dimension}:{" "}
                      <span className="font-normal text-navy-700">
                        {selectedAttributes[dimension] || "—"}
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {options.map((value) => {
                        const isSelected = selectedAttributes[dimension] === value;
                        // Check if this combination has a matching variant
                        const testAttrs = { ...selectedAttributes, [dimension]: value };
                        const matchExists = variantMatrix.variants.some((v) => {
                          const attrs = v.variantAttributes || {};
                          return variantMatrix.dimensions.every(
                            (d) => !testAttrs[d] || attrs[d] === testAttrs[d]
                          );
                        });

                        return (
                          <button
                            key={value}
                            onClick={() => handleAttributeChange(dimension, value)}
                            disabled={!matchExists}
                            className={cn(
                              "px-3.5 py-2 rounded-lg text-sm font-medium border transition-all",
                              isSelected
                                ? "border-navy bg-navy text-white shadow-sm"
                                : matchExists
                                  ? "border-gray-300 bg-white text-gray-700 hover:border-navy/50 hover:bg-navy-50"
                                  : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {/* Show selected variant indicator */}
              {selectedVariant && (
                <p className="text-xs text-gray-500">
                  Selected: <span className="font-medium text-navy">{selectedVariant.sku}</span>
                  {selectedVariant.upc && (
                    <span className="ml-2">UPC: {selectedVariant.upc}</span>
                  )}
                </p>
              )}
              {!selectedVariant && hasVariants && (
                <p className="text-xs text-amber-600 font-medium">
                  Select options above to choose a specific configuration
                </p>
              )}
            </div>
          )}

          {/* ADA / Certifications badges */}
          {(isAda || hasProp65) && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {isAda && (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full px-3 py-1 border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  ADA Compliant
                </span>
              )}
              {hasProp65 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full px-3 py-1 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Prop 65
                </span>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-card">
            {hasPrice ? (
              <div className="space-y-2">
                {product.pricing.basePrice && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-dark" />
                    <span className="text-sm text-gray-600">Your Price:</span>
                    <span className="text-3xl font-bold text-navy">
                      {formatPrice(product.pricing.basePrice)}
                    </span>
                  </div>
                )}
                {product.pricing.msrp && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">MSRP:</span>
                    <span
                      className={cn(
                        "text-gray-500",
                        product.pricing.basePrice && "line-through"
                      )}
                    >
                      {formatPrice(product.pricing.msrp)}
                    </span>
                  </div>
                )}
                {product.pricing.listPrice &&
                  product.pricing.listPrice !== product.pricing.basePrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">List:</span>
                      <span className="text-gray-500">
                        {formatPrice(product.pricing.listPrice)}
                      </span>
                    </div>
                  )}
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-amber-dark mb-1">
                  Request Quote for Pricing
                </p>
                <p className="text-sm text-gray-500">
                  Add to your quote cart and we&apos;ll provide pricing
                </p>
              </div>
            )}
          </div>

          {/* Add to quote */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-gray-100 rounded-l-lg transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-medium min-w-[3rem] text-center select-none">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-gray-100 rounded-r-lg transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="amber"
              size="lg"
              onClick={handleAddToQuote}
              className="flex-1"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Quote
            </Button>
          </div>

          {/* Quick dimensions preview */}
          {(product.dimensions.width ||
            product.dimensions.depth ||
            product.dimensions.height) && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                <Ruler className="w-4 h-4 text-navy-700" />
                Dimensions
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {product.dimensions.width && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center shadow-card">
                    <p className="text-label text-gray-500">Width</p>
                    <p className="font-semibold text-navy-800">
                      {product.dimensions.width}&quot;
                    </p>
                  </div>
                )}
                {product.dimensions.depth && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center shadow-card">
                    <p className="text-label text-gray-500">Depth</p>
                    <p className="font-semibold text-navy-800">
                      {product.dimensions.depth}&quot;
                    </p>
                  </div>
                )}
                {product.dimensions.height && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center shadow-card">
                    <p className="text-label text-gray-500">Height</p>
                    <p className="font-semibold text-navy-800">
                      {product.dimensions.height}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IDs / External links */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {product.homeDepotId && (
              <span className="flex items-center gap-1 font-sku">
                <ExternalLink className="w-4 h-4" />
                HD ID: {product.homeDepotId}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===================== Sentinel for sticky detection ===================== */}
      <div ref={heroSentinelRef} className="h-0" />

      {/* ===================== Tab Bar ===================== */}
      <div
        ref={tabBarRef}
        className={cn(
          "border-b border-gray-200 bg-white/95 backdrop-blur-sm z-30 mt-12 transition-shadow",
          isSticky
            ? "sticky top-0 shadow-card-hover"
            : ""
        )}
      >
        <div className="max-w-7xl mx-auto flex gap-0 overflow-x-auto">
          {tabs
            .filter((t) => t.available)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToTab(tab.id)}
                className={cn(
                  "relative px-5 py-4 text-sm font-semibold whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "text-navy"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber rounded-t" />
                )}
              </button>
            ))}
        </div>
      </div>

      {/* ===================== Tab Content ===================== */}
      <div className="mt-10 space-y-20">
        {/* -------- Overview Tab -------- */}
        <section
          ref={(el) => { sectionRefs.current.overview = el; }}
          id="tab-overview"
        >
          {/* Description */}
          {description && (
            <div className="mb-10 max-w-3xl">
              <h2 className="text-xl font-bold text-navy-800 mb-4">
                Product Description
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Bullet features */}
          {product.bullets.length > 0 && (
            <div className="mb-10 max-w-3xl">
              <h2 className="text-xl font-bold text-navy-800 mb-4">
                Features &amp; Benefits
              </h2>
              <ul className="space-y-3">
                {product.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Enhanced content blocks (alternating image/text) */}
          {product.enhancedContent && product.enhancedContent.length > 0 && (
            <div className="space-y-16">
              {product.enhancedContent.map((block, i) => (
                <div
                  key={i}
                  className={cn(
                    "grid md:grid-cols-2 gap-8 items-center",
                    i % 2 === 1 && "md:direction-rtl"
                  )}
                >
                  {/* Image */}
                  <div
                    className={cn(
                      "relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card",
                      i % 2 === 1 ? "md:order-2" : ""
                    )}
                  >
                    <Image
                      src={block.image}
                      alt={block.header}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      unoptimized
                    />
                  </div>

                  {/* Text */}
                  <div className={cn(i % 2 === 1 ? "md:order-1" : "")}>
                    <h3 className="text-lg font-bold text-navy-800 mb-3">
                      {block.header}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {block.paragraph}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fallback if overview has nothing */}
          {!description &&
            product.bullets.length === 0 &&
            (!product.enhancedContent || product.enhancedContent.length === 0) && (
              <p className="text-gray-400 italic">
                No detailed product information available.
              </p>
            )}
        </section>

        {/* -------- Specifications Tab -------- */}
        {(specEntries.length > 0 || warrantyEntries.length > 0) && (
          <section
            ref={(el) => { sectionRefs.current.specifications = el; }}
            id="tab-specifications"
          >
            <h2 className="text-xl font-bold text-navy-800 mb-6">
              Specifications
            </h2>

            {specEntries.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden mb-8">
                <table className="w-full text-sm">
                  <tbody>
                    {specEntries.map((entry, i) => (
                      <tr
                        key={entry.label}
                        className={cn(
                          i % 2 === 0 ? "bg-white" : "bg-gray-50"
                        )}
                      >
                        <td className="px-5 py-3 font-medium text-gray-700 w-1/3 whitespace-nowrap">
                          {entry.label}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {entry.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Dimensions card */}
            {product.specifications?.["product dimensions (in.)"] && (
              <div className="mb-8">
                <h3 className="font-semibold text-navy-800 mb-3 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Product Dimensions
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 shadow-card px-5 py-4">
                  <p className="text-gray-700 font-mono text-sm">
                    {product.specifications["product dimensions (in.)"]}
                  </p>
                </div>
              </div>
            )}

            {/* Warranty info */}
            {warrantyEntries.length > 0 && (
              <div>
                <h3 className="font-semibold text-navy-800 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Warranty
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {warrantyEntries.map((entry, i) => (
                        <tr
                          key={entry.label}
                          className={cn(
                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                          )}
                        >
                          <td className="px-5 py-3 font-medium text-gray-700 w-1/3">
                            {entry.label}
                          </td>
                          <td className="px-5 py-3 text-gray-600">
                            {entry.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* -------- Resources Tab -------- */}
        {hasResources && (
          <section
            ref={(el) => { sectionRefs.current.resources = el; }}
            id="tab-resources"
          >
            <h2 className="text-xl font-bold text-navy-800 mb-6">
              Resources
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Document resources */}
              {resourceList.map((res) => {
                const IconComp = res.icon;
                return (
                  <a
                    key={res.label}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:border-navy/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center group-hover:bg-navy-100 transition-colors">
                      <IconComp className="w-5 h-5 text-navy-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-navy transition-colors">
                        {res.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF Document</p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-navy transition-colors shrink-0" />
                  </a>
                );
              })}

              {/* Video resources */}
              {videoList.map((vid) => (
                <a
                  key={vid.label}
                  href={vid.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:border-navy/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber/10 flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                    <Video className="w-5 h-5 text-amber-dark" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-navy transition-colors">
                      {vid.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Video</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-navy transition-colors shrink-0" />
                </a>
              ))}

              {/* Home Depot link */}
              {product.retailLinks?.homeDepotUrl && (
                <a
                  href={product.retailLinks.homeDepotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 shadow-card hover:shadow-card-hover hover:border-orange-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      View on Home Depot
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Retail Listing</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-orange-600 transition-colors shrink-0" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* -------- Compatible Products Tab -------- */}
        {compatibleGroups.length > 0 && (
          <section
            ref={(el) => { sectionRefs.current.compatible = el; }}
            id="tab-compatible"
          >
            <h2 className="text-xl font-bold text-navy-800 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Compatible Products
            </h2>
            <Accordion.Root type="multiple" defaultValue={compatibleGroups.map((g) => g.category)} className="space-y-3">
              {compatibleGroups.map((group) => (
                <Accordion.Item
                  key={group.category}
                  value={group.category}
                  className="bg-white rounded-xl border border-gray-200 shadow-card overflow-hidden"
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="flex items-center justify-between w-full px-5 py-4 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors group">
                      <span>
                        {group.category}
                        <span className="text-gray-400 font-normal ml-2">
                          ({group.totalCount} product{group.totalCount !== 1 ? "s" : ""})
                        </span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180" />
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="overflow-hidden">
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {group.products.map((p) => (
                          <ProductCard key={p.id} product={p} />
                        ))}
                      </div>
                      {group.totalCount > 4 && (
                        <p className="text-xs text-gray-400 mt-3 text-center">
                          Showing 4 of {group.totalCount} — browse the catalog for more
                        </p>
                      )}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </section>
        )}

        {/* -------- Related Tab -------- */}
        {related.length > 0 && (
          <section
            ref={(el) => { sectionRefs.current.related = el; }}
            id="tab-related"
          >
            <h2 className="text-xl font-bold text-navy-800 mb-6">
              Related Products
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
