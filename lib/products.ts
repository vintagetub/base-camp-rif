import productData from "@/data/product_data.json";
import { normalizeBrand, resolveCategory } from "./utils";
import { CHANNEL, isBrandInChannel, IS_CHANNEL_SPECIFIC } from "./channel";

export interface ProductSpecifications {
  finish?: string;
  "glass type"?: string;
  "frame type"?: string;
  ada?: string;
  "prop 65"?: string;
  "drain position"?: string;
  "drain size (in.)"?: string;
  "drain included"?: string;
  "product dimensions (in.)"?: string;
  "residential warranty"?: string;
  "commercial warranty"?: string;
  "series name"?: string;
  style?: string;
  [key: string]: string | undefined;
}

export interface EnhancedContentItem {
  image: string;
  header: string;
  paragraph: string;
}

export interface Product {
  id: string;
  sku: string;
  basePart: string;
  brand: string;
  name: string;
  shortName: string;
  category: string;
  productType: string;
  collection: string;
  color: string;
  installationType: string;
  description: string;
  bullets: string[];
  images: string[];
  dimensions: {
    width: string;
    depth: string;
    height: string;
  };
  pricing: {
    basePrice: string;
    msrp: string;
    listPrice: string;
  };
  upc: string;
  homeDepotId: string;
  // V2 fields
  resources?: {
    "Use and Care"?: string;
    "Warranty Sheet - en-US"?: string;
    [key: string]: string | undefined;
  };
  videos?: {
    "brand video"?: string;
    "installation video"?: string;
    [key: string]: string | undefined;
  };
  descriptions?: {
    "detailed product description"?: string;
    "google long description"?: string;
    description?: string;
    [key: string]: string | undefined;
  };
  specifications?: ProductSpecifications;
  enhancedContent?: EnhancedContentItem[];
  retailLinks?: {
    homeDepotUrl?: string;
    [key: string]: string | undefined;
  };
  relatedProducts?: string[];
  // Variant fields (parent/child relationships)
  isParent?: boolean;
  parentId?: string | null;
  childVariantIds?: string[];
  variantDimensions?: string[];
  variantAttributes?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _allNormalized: Product[] = (productData as any[]).map((p) => ({
  ...p,
  id: p.id || "",
  sku: p.sku || p.id || "",
  basePart: p.basePart || "",
  brand: normalizeBrand(p.brand || "Other"),
  name: p.name || p.shortName || p.sku || p.id || "Unnamed Product",
  shortName: p.shortName || p.name || p.sku || p.id || "Unnamed",
  category: resolveCategory({ category: p.category, productType: p.productType, name: p.name || p.shortName }),
  productType: p.productType || "",
  collection: p.collection || "",
  color: p.color || "",
  installationType: p.installationType || "",
  description: p.description || "",
  bullets: p.bullets || [],
  images: p.images || [],
  dimensions: p.dimensions || { width: "", depth: "", height: "" },
  pricing: p.pricing || { basePrice: "", msrp: "", listPrice: "" },
  upc: p.upc || "",
  homeDepotId: p.homeDepotId || "",
}));

// Channel filter: keep only products whose brand is in the current channel.
// When channel is "all", no filtering is applied.
const allProducts: Product[] = IS_CHANNEL_SPECIFIC
  ? _allNormalized.filter((p) => isBrandInChannel(p.brand))
  : _allNormalized;

export function getAllProducts(): Product[] {
  return allProducts;
}

export function getProductById(id: string): Product | undefined {
  return allProducts.find((p) => p.id === id);
}

export function getProductBySku(sku: string): Product | undefined {
  return allProducts.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
}

export function getProductsByBrand(brand: string): Product[] {
  return allProducts.filter(
    (p) => p.brand.toLowerCase() === brand.toLowerCase()
  );
}

export function getBrands(): { name: string; count: number }[] {
  const brandMap = new Map<string, number>();
  allProducts.forEach((p) => {
    brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
  });
  return Array.from(brandMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategories(): { name: string; count: number }[] {
  const catMap = new Map<string, number>();
  allProducts.forEach((p) => {
    const cat = p.category || "Uncategorized";
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  return Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getColors(): string[] {
  const colors = new Set<string>();
  allProducts.forEach((p) => {
    if (p.color) colors.add(p.color);
  });
  return Array.from(colors).sort();
}

export function getInstallationTypes(): string[] {
  const types = new Set<string>();
  allProducts.forEach((p) => {
    if (p.installationType) types.add(p.installationType);
  });
  return Array.from(types).sort();
}

export function getCollections(): string[] {
  const collections = new Set<string>();
  allProducts.forEach((p) => {
    if (p.collection) collections.add(p.collection);
  });
  return Array.from(collections).sort();
}

export function getFinishes(): string[] {
  const finishes = new Set<string>();
  allProducts.forEach((p) => {
    const f = p.specifications?.finish;
    if (f) finishes.add(f);
  });
  return Array.from(finishes).sort();
}

export function getFrameTypes(): string[] {
  const types = new Set<string>();
  allProducts.forEach((p) => {
    const f = p.specifications?.["frame type"];
    if (f) types.add(f);
  });
  return Array.from(types).sort();
}

export function getGlassTypes(): string[] {
  const types = new Set<string>();
  allProducts.forEach((p) => {
    const f = p.specifications?.["glass type"];
    if (f) types.add(f);
  });
  return Array.from(types).sort();
}

export function getDescription(product: Product): string {
  return (
    product.descriptions?.["detailed product description"] ||
    product.descriptions?.["google long description"] ||
    product.descriptions?.description ||
    product.description ||
    ""
  );
}

// ---------------------------------------------------------------------------
// Variant helpers
// ---------------------------------------------------------------------------

/** Get only parent products + standalone products (for catalog display) */
export function getCatalogProducts(): Product[] {
  return allProducts.filter(
    (p) => p.isParent === true || (!p.parentId)
  );
}

/** Get child variants for a given parent product */
export function getChildVariants(parentId: string): Product[] {
  return allProducts.filter((p) => p.parentId === parentId);
}

/** Check if a product is a child variant */
export function isChildVariant(product: Product): boolean {
  return !!(product.parentId && product.parentId !== null);
}

/** Get parent product for a child variant */
export function getParentProduct(childProduct: Product): Product | undefined {
  if (!childProduct.parentId) return undefined;
  return allProducts.find((p) => p.id === childProduct.parentId);
}

/** Build variant matrix for the variant selector UI */
export function getVariantMatrix(parentId: string): {
  dimensions: string[];
  options: Record<string, string[]>;
  variants: Product[];
} {
  const parent = getProductById(parentId);
  if (!parent || !parent.isParent) {
    return { dimensions: [], options: {}, variants: [] };
  }

  const children = getChildVariants(parentId);
  const dimensions = parent.variantDimensions || [];

  // Build unique options per dimension
  const options: Record<string, string[]> = {};
  for (const dim of dimensions) {
    const values = new Set<string>();
    for (const child of children) {
      const val = child.variantAttributes?.[dim];
      if (val) values.add(val);
    }
    options[dim] = Array.from(values).sort();
  }

  return { dimensions, options, variants: children };
}

/** Find a specific variant matching a combination of attribute values */
export function findVariantByAttributes(
  parentId: string,
  attributes: Record<string, string>
): Product | undefined {
  const children = getChildVariants(parentId);
  return children.find((child) => {
    const childAttrs = child.variantAttributes || {};
    return Object.entries(attributes).every(
      ([key, val]) => childAttrs[key] === val
    );
  });
}

// ---------------------------------------------------------------------------
// Dimension parsing & bucketing for filter sidebar
// ---------------------------------------------------------------------------

/** Parse fractional inch like "34 3/4" → 34.75, or just "34" → 34 */
function parseFractionalInch(whole: string, frac?: string): number {
  let val = parseInt(whole);
  if (frac) {
    const parts = frac.split("/");
    if (parts.length === 2) val += parseInt(parts[0]) / parseInt(parts[1]);
  }
  return val;
}

export function parseProductDimensions(product: Product): { width: number; depth: number } | null {
  // Try structured dimensions field
  const d = product.dimensions;
  if (d) {
    const w = parseFloat(d.width);
    const dp = parseFloat(d.depth);
    if (w > 0 && dp > 0) {
      return { width: Math.max(w, dp), depth: Math.min(w, dp) };
    }
  }

  const name = product.name || "";

  // Pattern 1: "NN in. D x NN in. W" (DreamLine integer style)
  const dxw = name.match(/(\d+)\s*(?:in\.?|inch|")\s*D\s*x\s*(\d+)\s*(?:in\.?|inch|")\s*W/i);
  if (dxw) {
    const a = parseInt(dxw[1]), b = parseInt(dxw[2]);
    return { width: Math.max(a, b), depth: Math.min(a, b) };
  }

  // Pattern 2: "NN 3/4 inch D x NN 3/8 inch W" (DreamLine fractional style)
  const fracDxW = name.match(/(\d+)\s*(?:(\d+\/\d+)\s*)?(?:in\.?|inch|")\s*D\s*x\s*(\d+)\s*(?:(\d+\/\d+)\s*)?(?:-\s*(\d+)\s*(?:(\d+\/\d+)\s*)?)?(?:in\.?|inch|")\s*W/i);
  if (fracDxW) {
    const depth = Math.round(parseFractionalInch(fracDxW[1], fracDxW[2]));
    // If there's a range (e.g., "56 3/8 - 60 3/8"), use the upper value
    const width = fracDxW[5]
      ? Math.round(parseFractionalInch(fracDxW[5], fracDxW[6]))
      : Math.round(parseFractionalInch(fracDxW[3], fracDxW[4]));
    return { width: Math.max(width, depth), depth: Math.min(width, depth) };
  }

  // Pattern 3: "NN in. L x NN in. W" (freestanding tub Length x Width)
  const lxw = name.match(/(\d+)\s*(?:(\d+\/\d+)\s*)?(?:in\.?|inch|")\s*L\s*x\s*(\d+)\s*(?:(\d+\/\d+)\s*)?(?:in\.?|inch|")\s*W/i);
  if (lxw) {
    const length = Math.round(parseFractionalInch(lxw[1], lxw[2]));
    const width = Math.round(parseFractionalInch(lxw[3], lxw[4]));
    return { width: Math.max(length, width), depth: Math.min(length, width) };
  }

  // Pattern 4: "NN x NN" generic (e.g., "60 x 32", "36x36")
  const nxn = name.match(/(\d+)\s*(?:in\.?|inch|")?\s*[xX×]\s*(\d+)/);
  if (nxn) {
    const a = parseInt(nxn[1]), b = parseInt(nxn[2]);
    if (a >= 20 && b >= 20 && a <= 84 && b <= 84) {
      return { width: Math.max(a, b), depth: Math.min(a, b) };
    }
  }

  // Pattern 5: 4-digit model number encoding dims (SH6032 → 60x32, ShowerCast 6030 → 60x30)
  const modelDim = name.match(/(?:SH|VP|MTMK|SMMK|R-?)(\d{2})(\d{2})(?:\b|[^0-9])/i);
  if (modelDim) {
    const a = parseInt(modelDim[1]), b = parseInt(modelDim[2]);
    if (a >= 20 && b >= 20 && a <= 84 && b <= 84) {
      return { width: Math.max(a, b), depth: Math.min(a, b) };
    }
  }
  // Also match standalone 4-digit numbers like "ShowerCast 6032"
  const standaloneDim = name.match(/(?:ShowerCast|Kona|Aloha)\s+(\d{2})(\d{2})\b/i);
  if (standaloneDim) {
    const a = parseInt(standaloneDim[1]), b = parseInt(standaloneDim[2]);
    if (a >= 20 && b >= 20 && a <= 84 && b <= 84) {
      return { width: Math.max(a, b), depth: Math.min(a, b) };
    }
  }

  // Pattern 6: Single width "NN" W" or "NN in. W" (shower doors/enclosures — width only)
  const singleW = name.match(/(\d+(?:\.\d+)?)\s*(?:"|in\.?|inch)\s*W\b/i);
  if (singleW) {
    const w = Math.round(parseFloat(singleW[1]));
    if (w >= 20 && w <= 84) {
      // For doors/enclosures with only width, set depth=width as a reasonable default
      return { width: w, depth: w };
    }
  }

  // Pattern 7: Range width "NN - NN in. W" (sliding shower doors)
  const rangeW = name.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*(?:"|in\.?|inch)\s*\.?\s*W\b/i);
  if (rangeW) {
    const w = parseInt(rangeW[2]); // Use upper bound
    if (w >= 20 && w <= 84) {
      return { width: w, depth: w };
    }
  }

  return null;
}

/**
 * Get a display-friendly size label like "60 x 32" by snapping dimensions
 * to the nearest standard value (±2in tolerance).
 */
const DIM_SNAPS = [28, 30, 32, 34, 36, 38, 40, 42, 48, 54, 60, 66, 72];
const SNAP_TOLERANCE = 2;

function snapDim(val: number): number | null {
  for (const s of DIM_SNAPS) {
    if (Math.abs(val - s) <= SNAP_TOLERANCE) return s;
  }
  return null;
}

export function getSizeLabel(product: Product): string | null {
  const dims = parseProductDimensions(product);
  if (!dims) return null;
  const w = snapDim(dims.width);
  const d = snapDim(dims.depth);
  if (w === null || d === null) return null;
  return `${w} x ${d}`;
}

// ---------------------------------------------------------------------------

export interface FilterOptions {
  brands?: string[];
  categories?: string[];
  colors?: string[];
  installationTypes?: string[];
  collections?: string[];
  finishes?: string[];
  frameTypes?: string[];
  glassTypes?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  hasImages?: boolean;
  adaOnly?: boolean;
  hasVideo?: boolean;
  search?: string;
  sort?: string;
  parentsOnly?: boolean;
}

export function filterProducts(options: FilterOptions): Product[] {
  let results = options.parentsOnly
    ? allProducts.filter((p) => p.isParent === true || !p.parentId)
    : [...allProducts];

  if (options.search) {
    const q = options.search.toLowerCase();
    // Dimension search: "60x32" or "60 x 32"
    const dimMatch = q.match(/(\d+)\s*[x×]\s*(\d+)/i);

    results = results.filter((p) => {
      // Dimension matching
      if (dimMatch) {
        const w = dimMatch[1];
        const d = dimMatch[2];
        const dims = p.specifications?.["product dimensions (in.)"] || "";
        const dimW = p.dimensions?.width || "";
        const dimD = p.dimensions?.depth || "";
        if (dims.includes(w) && dims.includes(d)) return true;
        if (dimW.includes(w) && dimD.includes(d)) return true;
      }

      // Text search — includes UPC and Home Depot ID for pro desk lookups
      return (
        p.name.toLowerCase().includes(q) ||
        p.shortName.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.bullets.some((b) => b.toLowerCase().includes(q)) ||
        p.id.toLowerCase().includes(q) ||
        (p.upc || "").toLowerCase().includes(q) ||
        (p.homeDepotId || "").toLowerCase().includes(q) ||
        (p.basePart || "").toLowerCase().includes(q) ||
        (p.specifications?.finish || "").toLowerCase().includes(q) ||
        (p.specifications?.["glass type"] || "").toLowerCase().includes(q) ||
        (p.specifications?.["frame type"] || "").toLowerCase().includes(q) ||
        (p.specifications?.["series name"] || "").toLowerCase().includes(q) ||
        (p.specifications?.ada === "Yes" && q.includes("ada")) ||
        getDescription(p).toLowerCase().includes(q)
      );
    });
  }

  if (options.brands?.length) {
    results = results.filter((p) => options.brands!.includes(p.brand));
  }
  if (options.categories?.length) {
    results = results.filter((p) => options.categories!.includes(p.category));
  }
  if (options.colors?.length) {
    results = results.filter((p) => options.colors!.includes(p.color));
  }
  if (options.installationTypes?.length) {
    results = results.filter((p) =>
      options.installationTypes!.includes(p.installationType)
    );
  }
  if (options.collections?.length) {
    results = results.filter((p) =>
      options.collections!.includes(p.collection)
    );
  }
  if (options.finishes?.length) {
    results = results.filter((p) =>
      options.finishes!.includes(p.specifications?.finish || "")
    );
  }
  if (options.frameTypes?.length) {
    results = results.filter((p) =>
      options.frameTypes!.includes(p.specifications?.["frame type"] || "")
    );
  }
  if (options.glassTypes?.length) {
    results = results.filter((p) =>
      options.glassTypes!.includes(p.specifications?.["glass type"] || "")
    );
  }
  if (options.sizes?.length) {
    results = results.filter((p) => {
      const label = getSizeLabel(p);
      return label !== null && options.sizes!.includes(label);
    });
  }
  if (options.adaOnly) {
    results = results.filter((p) => p.specifications?.ada === "Yes");
  }
  if (options.hasVideo) {
    results = results.filter(
      (p) =>
        p.videos &&
        Object.values(p.videos).some((v) => v)
    );
  }
  if (options.priceMin !== undefined || options.priceMax !== undefined) {
    results = results.filter((p) => {
      const price = parseFloat(
        p.pricing.basePrice || p.pricing.listPrice || p.pricing.msrp
      );
      if (isNaN(price)) return false;
      if (options.priceMin !== undefined && price < options.priceMin) return false;
      if (options.priceMax !== undefined && price > options.priceMax) return false;
      return true;
    });
  }
  if (options.hasImages) {
    results = results.filter((p) => p.images.length > 0);
  }

  // Sort
  switch (options.sort) {
    case "price-asc":
      results.sort((a, b) => {
        const pa = parseFloat(a.pricing.basePrice || a.pricing.listPrice || "999999");
        const pb = parseFloat(b.pricing.basePrice || b.pricing.listPrice || "999999");
        return pa - pb;
      });
      break;
    case "price-desc":
      results.sort((a, b) => {
        const pa = parseFloat(a.pricing.basePrice || a.pricing.listPrice || "0");
        const pb = parseFloat(b.pricing.basePrice || b.pricing.listPrice || "0");
        return pb - pa;
      });
      break;
    case "brand":
      results.sort((a, b) => a.brand.localeCompare(b.brand));
      break;
    case "name":
      results.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      results.sort((a, b) => {
        const aHasImg = a.images.length > 0 ? 0 : 1;
        const bHasImg = b.images.length > 0 ? 0 : 1;
        if (aHasImg !== bHasImg) return aHasImg - bHasImg;
        return a.brand.localeCompare(b.brand);
      });
  }

  return results;
}

export function getRelatedProducts(product: Product, limit = 8): Product[] {
  const related: Product[] = [];
  const seen = new Set<string>([product.id]);

  // 1. Explicit related products from data
  if (product.relatedProducts?.length) {
    product.relatedProducts.forEach((rid) => {
      if (seen.has(rid)) return;
      const p = getProductById(rid);
      if (p) {
        related.push(p);
        seen.add(rid);
      }
    });
  }

  // 2. Same collection/brand
  if (product.collection && related.length < limit) {
    allProducts
      .filter(
        (p) =>
          !seen.has(p.id) &&
          p.collection === product.collection &&
          p.brand === product.brand
      )
      .slice(0, limit - related.length)
      .forEach((p) => {
        related.push(p);
        seen.add(p.id);
      });
  }

  // 3. Same category, different brand
  if (product.category && related.length < limit) {
    allProducts
      .filter(
        (p) =>
          !seen.has(p.id) &&
          p.category === product.category &&
          p.brand !== product.brand
      )
      .slice(0, limit - related.length)
      .forEach((p) => {
        related.push(p);
        seen.add(p.id);
      });
  }

  // 4. Fill remaining with same brand
  if (related.length < limit) {
    allProducts
      .filter((p) => !seen.has(p.id) && p.brand === product.brand)
      .slice(0, limit - related.length)
      .forEach((p) => {
        related.push(p);
        seen.add(p.id);
      });
  }

  return related.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Faceted counts — context-aware filter counts
// ---------------------------------------------------------------------------
// For each filter dimension, we apply ALL other active filters EXCEPT that
// dimension, then count values. This way the counts reflect what's actually
// reachable when toggling a filter value.
// ---------------------------------------------------------------------------

export interface FacetCounts {
  brands: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  colors: string[];
  installationTypes: string[];
  finishes: string[];
  frameTypes: string[];
  glassTypes: string[];
  sizes: { label: string; count: number }[];
}

export function computeFacets(filters: FilterOptions): FacetCounts {
  // Helper: apply all filters EXCEPT the excluded dimension
  const applyFiltersExcept = (exclude: keyof FilterOptions): Product[] => {
    const opts = { ...filters, [exclude]: undefined };
    // Also remove sort to avoid unnecessary work
    opts.sort = undefined;
    return filterProducts(opts);
  };

  // Brand facet — apply all filters except brands
  const forBrands = applyFiltersExcept("brands");
  const brandMap = new Map<string, number>();
  forBrands.forEach((p) => {
    if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
  });
  const brands = Array.from(brandMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Category facet
  const forCategories = applyFiltersExcept("categories");
  const catMap = new Map<string, number>();
  forCategories.forEach((p) => {
    const cat = p.category || "Uncategorized";
    catMap.set(cat, (catMap.get(cat) || 0) + 1);
  });
  const categories = Array.from(catMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Color facet
  const forColors = applyFiltersExcept("colors");
  const colorSet = new Set<string>();
  forColors.forEach((p) => { if (p.color) colorSet.add(p.color); });
  const colors = Array.from(colorSet).sort();

  // Installation type facet
  const forInstall = applyFiltersExcept("installationTypes");
  const installSet = new Set<string>();
  forInstall.forEach((p) => { if (p.installationType) installSet.add(p.installationType); });
  const installationTypes = Array.from(installSet).sort();

  // Finish facet
  const forFinish = applyFiltersExcept("finishes");
  const finishSet = new Set<string>();
  forFinish.forEach((p) => { const f = p.specifications?.finish; if (f) finishSet.add(f); });
  const finishes = Array.from(finishSet).sort();

  // Frame type facet
  const forFrame = applyFiltersExcept("frameTypes");
  const frameSet = new Set<string>();
  forFrame.forEach((p) => { const f = p.specifications?.["frame type"]; if (f) frameSet.add(f); });
  const frameTypes = Array.from(frameSet).sort();

  // Glass type facet
  const forGlass = applyFiltersExcept("glassTypes");
  const glassSet = new Set<string>();
  forGlass.forEach((p) => { const f = p.specifications?.["glass type"]; if (f) glassSet.add(f); });
  const glassTypes = Array.from(glassSet).sort();

  // Size facet (combined "W x D")
  const forSizes = applyFiltersExcept("sizes");
  const sizeMap = new Map<string, number>();
  forSizes.forEach((p) => {
    const label = getSizeLabel(p);
    if (label) sizeMap.set(label, (sizeMap.get(label) || 0) + 1);
  });
  const sizes = Array.from(sizeMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      // Sort by first number (width), then by second (depth)
      const [aw, ad] = a.label.split(" x ").map(Number);
      const [bw, bd] = b.label.split(" x ").map(Number);
      if (aw !== bw) return aw - bw;
      return ad - bd;
    });

  return { brands, categories, colors, installationTypes, finishes, frameTypes, glassTypes, sizes };
}
