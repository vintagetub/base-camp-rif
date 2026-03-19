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
  return brandMap[brand] || brand;
}

export function simplifyCategory(category: string): string {
  if (!category) return "Uncategorized";
  // Remove parent category prefix
  const parts = category.split(" / ");
  return parts[parts.length - 1] || "Uncategorized";
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
