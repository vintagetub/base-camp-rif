import { type Product, getAllProducts, getCatalogProducts } from "./products";

interface CompatibleGroup {
  category: string;
  products: Product[];
  totalCount: number;
}

const RELATED_CATEGORY_MAP: Record<string, string[]> = {
  "Bathtubs": ["Wall", "Shower Doors", "Shower Enclosures", "Shower Bases"],
  "Shower Bases": ["Wall", "Shower Doors", "Shower Enclosures", "Shower Door and Base", "Shower Door, Base and Walls"],
  "Wall": ["Shower Bases", "Bathtubs", "Shower Doors"],
  "Shower Doors": ["Shower Bases", "Wall", "Bathtubs", "Shower Enclosures"],
  "Shower Enclosures": ["Shower Bases", "Wall", "Bathtubs", "Shower Doors"],
  "Showers": ["Wall", "Shower Doors", "Shower Bases", "Shower Enclosures"],
  "Shower Door and Base": ["Wall", "Shower Doors", "Shower Enclosures"],
  "Shower Door, Base and Walls": ["Shower Doors", "Shower Bases", "Wall"],
};

const MAX_PER_GROUP = 4;

/**
 * Find compatible products for a given product.
 * Matches by basePart, then category+brand, then collection.
 * Groups results by category.
 *
 * Designed to be easily swappable with an API call later.
 */
export function getCompatibleProducts(product: Product): CompatibleGroup[] {
  const all = getCatalogProducts();
  const seen = new Set<string>([product.id]);
  const grouped = new Map<string, Product[]>();

  function addToGroup(p: Product) {
    if (seen.has(p.id)) return;
    seen.add(p.id);
    const cat = p.category || "Other";
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)!.push(p);
  }

  // 1. Same basePart (variant companions)
  if (product.basePart) {
    all
      .filter((p) => p.basePart === product.basePart)
      .forEach(addToGroup);
  }

  // 2. Same brand + related categories
  const relatedCats = RELATED_CATEGORY_MAP[product.category] || [];
  if (relatedCats.length > 0) {
    all
      .filter((p) => p.brand === product.brand && relatedCats.includes(p.category))
      .forEach(addToGroup);
  }

  // 3. Same collection
  if (product.collection) {
    all
      .filter((p) => p.collection === product.collection)
      .forEach(addToGroup);
  }

  // Build result groups
  const result: CompatibleGroup[] = [];
  grouped.forEach((products, category) => {
    result.push({
      category,
      products: products.slice(0, MAX_PER_GROUP),
      totalCount: products.length,
    });
  });

  // Sort groups by total count descending
  result.sort((a, b) => b.totalCount - a.totalCount);

  return result;
}
