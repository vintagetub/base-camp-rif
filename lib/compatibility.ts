import { type Product, getCatalogProducts } from "./products";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoredProduct {
  product: Product;
  score: number;
  matchType: string;
}

export interface CompatibleGroup {
  category: string;
  products: ScoredProduct[];
  totalCount: number;
}

export const MAX_PER_GROUP = 6;

// ---------------------------------------------------------------------------
// Dimension Parsing
// ---------------------------------------------------------------------------

export function parseDimensions(
  product: Product
): { depth: number; width: number } | null {
  // Source 1: Product dimensions field
  const d = product.dimensions;
  if (d) {
    const depth = parseFloat(String(d.depth));
    const width = parseFloat(String(d.width));
    if (depth > 0 && width > 0) {
      return normalize(depth, width);
    }
  }

  // Source 2: Product name regex
  const name = product.name || "";

  // Pattern 1: DxW explicit (e.g. "36 in. D x 60 in. W")
  const p1 =
    /(\d+)\s*(?:in\.?|inch|")\s*D\s*x\s*(\d+)\s*(?:in\.?|inch|")\s*W/i;
  const m1 = name.match(p1);
  if (m1) {
    return normalize(parseFloat(m1[1]), parseFloat(m1[2]));
  }

  // Pattern 2: generic NxN (e.g. "60 x 32")
  const p2 = /(\d+)\s*(?:in\.?|inch|")?\s*[xX×]\s*(\d+)/;
  const m2 = name.match(p2);
  if (m2) {
    return normalize(parseFloat(m2[1]), parseFloat(m2[2]));
  }

  return null;
}

function normalize(
  a: number,
  b: number
): { depth: number; width: number } {
  return a <= b ? { depth: a, width: b } : { depth: b, width: a };
}

// ---------------------------------------------------------------------------
// Indexes (lazy, built once)
// ---------------------------------------------------------------------------

let _dimensionIndex: Map<string, Product[]> | null = null;
let _collectionIndex: Map<string, Product[]> | null = null;

function getDimensionIndex(): Map<string, Product[]> {
  if (_dimensionIndex) return _dimensionIndex;
  _dimensionIndex = new Map();
  for (const p of getCatalogProducts()) {
    const dims = parseDimensions(p);
    if (!dims) continue;
    const key = `${dims.depth}x${dims.width}`;
    if (!_dimensionIndex.has(key)) _dimensionIndex.set(key, []);
    _dimensionIndex.get(key)!.push(p);
  }
  return _dimensionIndex;
}

function getCollectionIndex(): Map<string, Product[]> {
  if (_collectionIndex) return _collectionIndex;
  _collectionIndex = new Map();
  for (const p of getCatalogProducts()) {
    if (!p.collection) continue;
    const key = p.collection.toLowerCase().trim();
    if (!_collectionIndex.has(key)) _collectionIndex.set(key, []);
    _collectionIndex.get(key)!.push(p);
  }
  return _collectionIndex;
}

// ---------------------------------------------------------------------------
// Product Type Normalization
// ---------------------------------------------------------------------------

export function getNormalizedType(p: Product): string {
  if (p.category && p.category !== "Uncategorized") return p.category;

  const typeMap: Record<string, string> = {
    "Shower Door": "Shower Doors",
    "Shower Enclosure": "Shower Enclosures",
    "Shower Base": "Shower Bases",
    "Shower Enclosure and Base": "Shower Enclosure and Base",
    "Shower Door and Base": "Shower Door and Base",
    "Shower Door, Base and Backwalls": "Shower Door, Base and Walls",
    "Shower Enclosure, Base and Backwalls": "Shower Enclosure and Base",
    "Bathtub": "Bathtubs",
    "Tub": "Bathtubs",
    "Tub Shower": "Bathtubs",
    "Backwall": "Wall",
    "Shower Head": "Fixtures",
    Sinks: "Sinks",
    "Home Spa": "Bathtubs",
  };

  if (p.productType && typeMap[p.productType]) return typeMap[p.productType];
  if (p.productType) return p.productType;

  const name = p.name.toLowerCase();
  if (name.includes("shower base") || name.includes("shower pan"))
    return "Shower Bases";
  if (name.includes("shower door")) return "Shower Doors";
  if (name.includes("bathtub") || name.includes("soaking tub"))
    return "Bathtubs";
  if (
    name.includes("backwall") ||
    name.includes("wall panel") ||
    name.includes("wall system")
  )
    return "Wall";
  if (name.includes("enclosure")) return "Shower Enclosures";

  return "Other";
}

// ---------------------------------------------------------------------------
// Cross-Category Compatibility Rules
// ---------------------------------------------------------------------------

const CROSS_CATEGORY_RULES: Record<string, string[]> = {
  "Shower Bases": ["Shower Doors", "Shower Enclosures", "Wall"],
  "Shower Doors": ["Shower Bases", "Wall", "Bathtubs"],
  "Shower Enclosures": ["Shower Bases", "Wall"],
  Wall: ["Shower Bases", "Shower Doors", "Shower Enclosures", "Bathtubs"],
  Bathtubs: ["Wall", "Shower Doors", "Tub Door"],
  "Tub Door": ["Bathtubs"],
  Showers: ["Wall", "Shower Doors"],
  Fixtures: ["Shower Bases", "Shower Doors", "Bathtubs", "Wall"],
};

const KIT_TYPES = new Set([
  "Shower Door and Base",
  "Shower Door, Base and Walls",
  "Shower Enclosure and Base",
  "Shower Kit",
]);

function getCompatibleTypes(type: string): string[] {
  if (KIT_TYPES.has(type)) {
    if (type === "Shower Door, Base and Walls") return ["Fixtures"];
    return ["Wall", "Fixtures"];
  }
  return CROSS_CATEGORY_RULES[type] || [];
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function scoreMatch(
  source: Product,
  candidate: Product,
  sourceType: string,
  candidateType: string,
  dimMatch: boolean,
  seriesMatch: boolean
): ScoredProduct | null {
  if (candidate.id === source.id) return null;
  if (candidateType === sourceType) return null;

  const compatTypes = getCompatibleTypes(sourceType);
  if (!compatTypes.includes(candidateType)) return null;

  let score = 0;
  let matchType = "";

  if (dimMatch && seriesMatch) {
    score = 95;
    matchType = "dimension+series";
  } else if (dimMatch && candidate.brand === source.brand) {
    score = 85;
    matchType = "dimension+brand";
  } else if (dimMatch) {
    score = 75;
    matchType = "dimension";
  } else if (seriesMatch) {
    score = 65;
    matchType = "series";
  } else {
    return null;
  }

  if (candidate.brand === source.brand) score = Math.min(100, score + 5);

  return { product: candidate, score, matchType };
}

// ---------------------------------------------------------------------------
// Main Export
// ---------------------------------------------------------------------------

export function getCompatibleProducts(product: Product): CompatibleGroup[] {
  const sourceType = getNormalizedType(product);
  const sourceDims = parseDimensions(product);
  const sourceCollection =
    product.collection?.toLowerCase().trim() || "";

  const dimIndex = getDimensionIndex();
  const colIndex = getCollectionIndex();

  const seen = new Set<string>([product.id]);
  const groupMap = new Map<string, ScoredProduct[]>();

  function addMatch(sp: ScoredProduct) {
    if (seen.has(sp.product.id)) return;
    seen.add(sp.product.id);
    const cat = getNormalizedType(sp.product);
    if (!groupMap.has(cat)) groupMap.set(cat, []);
    groupMap.get(cat)!.push(sp);
  }

  // Layer 1: Dimension matching (primary signal)
  if (sourceDims) {
    const key = `${sourceDims.depth}x${sourceDims.width}`;
    const dimMatches = dimIndex.get(key) || [];

    // Fuzzy keys: ±2 inch tolerance
    const fuzzyKeys = [
      `${sourceDims.depth - 1}x${sourceDims.width}`,
      `${sourceDims.depth + 1}x${sourceDims.width}`,
      `${sourceDims.depth - 2}x${sourceDims.width}`,
      `${sourceDims.depth + 2}x${sourceDims.width}`,
      `${sourceDims.depth}x${sourceDims.width - 1}`,
      `${sourceDims.depth}x${sourceDims.width + 1}`,
      `${sourceDims.depth}x${sourceDims.width - 2}`,
      `${sourceDims.depth}x${sourceDims.width + 2}`,
    ];

    // Exact dimension matches first
    for (const candidate of dimMatches) {
      const candidateType = getNormalizedType(candidate);
      const seriesMatch =
        !!sourceCollection &&
        candidate.collection?.toLowerCase().trim() === sourceCollection;
      const sp = scoreMatch(
        product,
        candidate,
        sourceType,
        candidateType,
        true,
        seriesMatch
      );
      if (sp) addMatch(sp);
    }

    // Fuzzy dimension matches (lower priority)
    for (const fk of fuzzyKeys) {
      const fuzzyMatches = dimIndex.get(fk) || [];
      for (const candidate of fuzzyMatches) {
        const candidateType = getNormalizedType(candidate);
        const seriesMatch =
          !!sourceCollection &&
          candidate.collection?.toLowerCase().trim() === sourceCollection;
        const sp = scoreMatch(
          product,
          candidate,
          sourceType,
          candidateType,
          true,
          seriesMatch
        );
        if (sp) {
          sp.score -= 10;
          sp.matchType = "fuzzy-" + sp.matchType;
          addMatch(sp);
        }
      }
    }
  }

  // Layer 2: Collection/series matching
  if (sourceCollection) {
    const colMatches = colIndex.get(sourceCollection) || [];
    for (const candidate of colMatches) {
      const candidateType = getNormalizedType(candidate);
      const sp = scoreMatch(
        product,
        candidate,
        sourceType,
        candidateType,
        false,
        true
      );
      if (sp) addMatch(sp);
    }
  }

  // Build result groups, sorted by score within each group
  const result: CompatibleGroup[] = [];
  groupMap.forEach((scored, category) => {
    scored.sort((a, b) => b.score - a.score);
    result.push({
      category,
      products: scored.slice(0, MAX_PER_GROUP),
      totalCount: scored.length,
    });
  });

  // Sort groups: most products first
  result.sort((a, b) => b.totalCount - a.totalCount);

  return result;
}
