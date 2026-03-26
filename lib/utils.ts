import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: string | number | undefined): string {
  if (!price) return "";
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export function normalizeBrand(brand: string): string {
  const brandMap: Record<string, string> = {
    "AMERICAN STANDARD": "American Standard",
    "american standard": "American Standard",
    MAAX: "MAAX",
    Maax: "MAAX",
    maax: "MAAX",
    Swan: "Swan",
    SWAN: "Swan",
    swan: "Swan",
    Bootz: "Bootz",
    BOOTZ: "Bootz",
    Aquatic: "Aquatic",
    AQUATIC: "Aquatic",
    Dreamline: "Dreamline",
    DREAMLINE: "Dreamline",
    DreamLine: "Dreamline",
    Clarion: "Clarion",
    CLARION: "Clarion",
    Aker: "Aker",
    AKER: "Aker",
    Mansfield: "Mansfield",
    MANSFIELD: "Mansfield",
    "Mr. Steam": "Mr. Steam",
    "Coastal Shower Doors": "Coastal Shower Doors",
    "COASTAL SHOWER DOORS": "Coastal Shower Doors",
    "coastal shower doors": "Coastal Shower Doors",
    Coastal: "Coastal Shower Doors",
    Unknown: "Other",
  };
  if (!brand) return "Other";
  return brandMap[brand] || brand;
}

export function simplifyCategory(category: string): string {
  if (!category) return "Uncategorized";
  // Remove parent category prefix
  const parts = category.split(" / ");
  return parts[parts.length - 1] || "Uncategorized";
}

/**
 * Resolve a product's display category using all available data:
 *  1. Raw `category` field (after simplification)
 *  2. `productType` field mapped to a display category
 *  3. Name-based inference
 *  4. "Other" as last resort
 */
export function resolveCategory(product: {
  category?: string;
  productType?: string;
  name?: string;
}): string {
  // 1. Use category if present
  const cat = product.category ? simplifyCategory(product.category) : "";
  if (cat && cat !== "Uncategorized") return cat;

  // 2. Fall back to productType → display category mapping
  if (product.productType) {
    const mapped = mapProductTypeToCategory(product.productType);
    if (mapped) return mapped;
  }

  // 3. Name-based inference
  if (product.name) {
    const inferred = inferCategoryFromName(product.name);
    if (inferred) return inferred;
  }

  return "Other";
}

const PRODUCT_TYPE_TO_CATEGORY: Record<string, string> = {
  "Shower Door": "Shower Doors",
  "Shower Door and Base": "Shower Door and Base",
  "Shower Door, Base and Backwalls": "Shower Door, Base and Walls",
  "Shower Enclosure": "Shower Enclosures",
  "Shower Enclosure and Base": "Shower Enclosure and Base",
  "Shower Enclosure, Base and Backwalls": "Shower Door, Base and Walls",
  "Shower Base": "Shower Bases",
  "Bathtub": "Bathtubs",
  "Tub": "Bathtubs",
  "Tub Shower": "Showers",
  "Backwall": "Wall",
  "Sinks": "Sinks",
  "Shower Head": "Fixtures",
  "Faucet - Shower": "Fixtures",
  "Home Spa": "Fixtures",
  "Shower Kit": "Shower Kit",
};

function mapProductTypeToCategory(productType: string): string | null {
  return PRODUCT_TYPE_TO_CATEGORY[productType] || null;
}

function inferCategoryFromName(name: string): string | null {
  const lower = name.toLowerCase();

  // Order matters — check more specific patterns first
  if (lower.includes("shower door") && lower.includes("base") && lower.includes("wall"))
    return "Shower Door, Base and Walls";
  if (lower.includes("shower door") && lower.includes("base"))
    return "Shower Door and Base";
  if (lower.includes("shower enclosure") && lower.includes("base"))
    return "Shower Enclosure and Base";
  if (lower.includes("shower enclosure") || lower.includes("shower stall"))
    return "Shower Enclosures";
  if (lower.includes("shower door"))
    return "Shower Doors";
  if (lower.includes("shower base") || lower.includes("shower pan"))
    return "Shower Bases";
  if (lower.includes("shower head") || lower.includes("showerhead"))
    return "Fixtures";
  if (lower.includes("shower kit"))
    return "Shower Kit";
  if (lower.includes("shower"))
    return "Showers";
  if (lower.includes("tub door"))
    return "Tub Door";
  if (lower.includes("bathtub") || lower.includes("alcove") || lower.includes("soaking"))
    return "Bathtubs";
  if (lower.includes("wall panel") || lower.includes("backwall") || lower.includes("back wall"))
    return "Wall";
  if (lower.includes("faucet"))
    return "Fixtures";
  if (lower.includes("sink") || lower.includes("vanity"))
    return "Sinks";

  return null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateQuoteRef(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ABG-${date}-${rand}`;
}
