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
  category: string;       // Display label for the group
  products: ScoredProduct[];
  totalCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_PER_GROUP = 6;

/** Product types that are already complete systems */
const KIT_TYPES = new Set([
  "Shower Door and Base",
  "Shower Door, Base and Walls",
  "Shower Enclosure and Base",
  "Shower Kit",
]);

/**
 * Cross-category compatibility rules.
 * Key = source normalized type, Value = types that CAN appear as recommendations.
 */
const CROSS_CATEGORY_RULES: Record<string, string[]> = {
  "Shower Bases":       ["Shower Doors", "Shower Enclosures", "Wall", "Fixtures"],
  "Shower Doors":       ["Shower Bases", "Wall", "Fixtures"],
  "Tub Doors":          ["Bathtubs"],
  "Shower Enclosures":  ["Shower Bases", "Wall", "Fixtures"],
  "Wall":               ["Shower Bases", "Shower Doors", "Shower Enclosures"],
  "Bathtubs":           ["Wall", "Tub Doors", "Fixtures"],
  "Showers":            ["Wall", "Shower Doors", "Fixtures"],
  "Fixtures":           [],  // Fixtures are shown FOR others, not the other way around
};

// ---------------------------------------------------------------------------
// Product Type Normalization
// ---------------------------------------------------------------------------

/**
 * Resolve the effective product type from category → productType → name inference.
 * Returns a canonical type string used for cross-category rule lookups.
 */
function getNormalizedType(p: Product): string {
  // 1. Use category if populated
  if (p.category && p.category !== "Uncategorized") {
    // Special case: detect tub doors that are miscategorized as shower doors
    if (p.category === "Shower Doors" && isTubDoor(p)) return "Tub Doors";
    if (p.category === "Tub Door") return "Tub Doors";
    return p.category;
  }

  // 2. Map productType to canonical category
  const typeMap: Record<string, string> = {
    "Shower Door":                     "Shower Doors",
    "Shower Enclosure":                "Shower Enclosures",
    "Shower Base":                     "Shower Bases",
    "Shower Enclosure and Base":       "Shower Enclosure and Base",
    "Shower Door and Base":            "Shower Door and Base",
    "Shower Door, Base and Backwalls": "Shower Door, Base and Walls",
    "Shower Enclosure, Base and Backwalls": "Shower Enclosure and Base",
    "Bathtub":                         "Bathtubs",
    "Tub":                             "Bathtubs",
    "Tub Shower":                      "Bathtubs",
    "Backwall":                        "Wall",
    "Shower Head":                     "Fixtures",
    "Sinks":                           "Sinks",
    "Home Spa":                        "Bathtubs",
  };

  if (p.productType && typeMap[p.productType]) {
    const mapped = typeMap[p.productType];
    if (mapped === "Shower Doors" && isTubDoor(p)) return "Tub Doors";
    return mapped;
  }
  if (p.productType) return p.productType;

  // 3. Infer from name as last resort
  const name = p.name.toLowerCase();
  if (/tub\s*(door|enclosure)/i.test(name))                     return "Tub Doors";
  if (name.includes("shower base") || name.includes("shower pan")) return "Shower Bases";
  if (name.includes("shower door"))                               return "Shower Doors";
  if (/bathtub|soaking\s*tub|\balcove\b.*\btub\b/.test(name))   return "Bathtubs";
  if (/backwall|wall\s*(panel|system|kit)|\bshower\s*wall/.test(name)) return "Wall";
  if (/neo.?angle/.test(name) && /enclosure/.test(name))         return "Shower Enclosures";
  if (name.includes("enclosure"))                                 return "Shower Enclosures";
  if (/shower\s*head|faucet|showerhead|rain.*shower/.test(name)) return "Fixtures";
  if (/pedestal.*sink|vanity|sink/.test(name))                   return "Sinks";
  if (/one.?piece\s*shower/.test(name))                          return "Showers";

  return "Other";
}

/** Detect tub doors by name — the category field doesn't distinguish them */
function isTubDoor(p: Product): boolean {
  return /tub\s*(door|enclosure)/i.test(p.name || "");
}

// ---------------------------------------------------------------------------
// Installation Geometry
// ---------------------------------------------------------------------------

type Geometry = "neo-angle" | "corner" | "alcove" | "freestanding" | "standard";

function getGeometry(p: Product): Geometry {
  const name = (p.name || "").toLowerCase();
  const instType = (p.installationType || "").toLowerCase();

  if (/neo.?angle/.test(name) || instType === "corner") return "neo-angle";
  if (/\bcorner\b/.test(name) && !/neo/.test(name))     return "corner";
  if (/freestanding/.test(name) || instType === "freestanding") return "freestanding";
  if (/\balcove\b/.test(name) || instType === "alcove" || instType === "3-wall alcove") return "alcove";

  return "standard"; // Default — no geometry constraint
}

/**
 * Check if two products have compatible installation geometry.
 * Neo-angle only matches neo-angle. Freestanding only matches freestanding.
 * Everything else is compatible with each other.
 */
function isGeometryCompatible(a: Geometry, b: Geometry): boolean {
  // Neo-angle is exclusive
  if (a === "neo-angle" || b === "neo-angle") return a === b;
  // Freestanding is exclusive
  if (a === "freestanding" || b === "freestanding") return a === b;
  // Everything else is compatible
  return true;
}

// ---------------------------------------------------------------------------
// Dimension Parsing
// ---------------------------------------------------------------------------

interface ParsedDimensions {
  depth: number;   // Smaller number (front-to-back)
  width: number;   // Larger number (side-to-side)
}

/**
 * Parse product dimensions from the dimensions field or product name.
 * Always normalizes so depth <= width for consistent keys.
 */
function parseDimensions(product: Product): ParsedDimensions | null {
  // Try structured dimensions field first (only if both are populated)
  const dw = product.dimensions;
  if (dw) {
    const w = parseFloat(String(dw.width));
    const d = parseFloat(String(dw.depth));
    if (w > 0 && d > 0) {
      return { depth: Math.min(d, w), width: Math.max(d, w) };
    }
  }

  // Parse from product name
  const name = product.name || "";

  // Pattern 1: "NN in. D x NN in. W" (DreamLine style)
  const dxw = name.match(/(\d+)\s*(?:in\.?|inch|")\s*D\s*x\s*(\d+)\s*(?:in\.?|inch|")\s*W/i);
  if (dxw) {
    const a = parseInt(dxw[1]), b = parseInt(dxw[2]);
    return { depth: Math.min(a, b), width: Math.max(a, b) };
  }

  // Pattern 2: "NN x NN" generic (Bootz, MAAX, Aquatic, Swan style)
  const nxn = name.match(/(\d+)\s*(?:in\.?|inch|")?\s*[xX×]\s*(\d+)/);
  if (nxn) {
    const a = parseInt(nxn[1]), b = parseInt(nxn[2]);
    // Filter out small numbers that are likely model numbers, not dimensions
    if (a >= 20 && b >= 20 && a <= 84 && b <= 84) {
      return { depth: Math.min(a, b), width: Math.max(a, b) };
    }
  }

  return null;
}

/** Create a string key from parsed dimensions */
function dimKey(dims: ParsedDimensions): string {
  return `${dims.depth}x${dims.width}`;
}

// ---------------------------------------------------------------------------
// Drain Position
// ---------------------------------------------------------------------------

type DrainPosition = "left" | "right" | "center" | "corner" | "end" | "rear-center" | "unknown";

function getDrainPosition(p: Product): DrainPosition | null {
  // Check specs first
  const dp = p.specifications?.["drain position"];
  if (dp) {
    const v = dp.toLowerCase().trim();
    if (v.includes("left"))         return "left";
    if (v.includes("right"))        return "right";
    if (v.includes("rear center"))  return "rear-center";
    if (v.includes("front center")) return "center";
    if (v === "center")             return "center";
    if (v.includes("corner"))       return "corner";
    if (v.includes("end"))          return "end";
    return "unknown";
  }

  // Parse from name
  const name = (p.name || "").toLowerCase();
  if (/\bleft\s*drain/.test(name))   return "left";
  if (/\bright\s*drain/.test(name))  return "right";
  if (/\bcenter\s*drain/.test(name)) return "center";
  if (/\bcorner\s*drain/.test(name)) return "corner";

  return null; // No drain info — not a constraint
}

// ---------------------------------------------------------------------------
// Indexes (lazy-initialized)
// ---------------------------------------------------------------------------

let _dimensionIndex: Map<string, Product[]> | null = null;
let _collectionIndex: Map<string, Product[]> | null = null;

function getDimensionIndex(): Map<string, Product[]> {
  if (_dimensionIndex) return _dimensionIndex;
  _dimensionIndex = new Map();
  for (const p of getCatalogProducts()) {
    const dims = parseDimensions(p);
    if (!dims) continue;
    const key = dimKey(dims);
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
// Compatible Types
// ---------------------------------------------------------------------------

function getCompatibleTypes(type: string): string[] {
  if (KIT_TYPES.has(type)) {
    // Kits already include door+base; only suggest what's missing
    if (type === "Shower Door, Base and Walls") return ["Fixtures"];
    if (type === "Shower Enclosure and Base")   return ["Wall", "Fixtures"];
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
  sourceGeometry: Geometry,
  dimMatch: boolean,
  fuzzy: boolean,
  seriesMatch: boolean,
): ScoredProduct | null {
  // Hard filter: skip self
  if (candidate.id === source.id) return null;

  // Hard filter: must be a different type (we want cross-category)
  if (candidateType === sourceType) return null;

  // Hard filter: candidate type must be in the allowed list
  const compatTypes = getCompatibleTypes(sourceType);
  if (!compatTypes.includes(candidateType)) return null;

  // Hard filter: geometry must be compatible (neo-angle ↔ neo-angle only)
  const candidateGeometry = getGeometry(candidate);
  if (!isGeometryCompatible(sourceGeometry, candidateGeometry)) return null;

  // Hard filter: compartment-type safety
  // Shower doors must not appear for bathtubs (only tub doors can)
  // Bathtubs must not appear for shower doors (only shower bases can)
  if (sourceType === "Bathtubs" && candidateType === "Shower Doors") return null;
  if (sourceType === "Shower Doors" && candidateType === "Bathtubs") return null;
  if (sourceType === "Shower Bases" && candidateType === "Tub Doors") return null;
  if (sourceType === "Tub Doors" && candidateType === "Shower Bases") return null;

  // Score assignment
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
    return null; // No matching signal at all
  }

  // Apply modifiers
  if (fuzzy) {
    score -= 10;
    matchType = "fuzzy-" + matchType;
  }
  if (candidate.brand === source.brand) score = Math.min(100, score + 5);

  // Neo-angle same-dim same-geo bonus (these are strong matches)
  if (sourceGeometry === "neo-angle" && candidateGeometry === "neo-angle" && dimMatch) {
    score = Math.min(100, score + 5);
  }

  return { product: candidate, score, matchType };
}

// ---------------------------------------------------------------------------
// Main API
// ---------------------------------------------------------------------------

export function getCompatibleProducts(product: Product): CompatibleGroup[] {
  const sourceType = getNormalizedType(product);
  const sourceDims = parseDimensions(product);
  const sourceGeometry = getGeometry(product);
  const sourceCollection = product.collection?.toLowerCase().trim() || "";

  // Don't try to match "Other", "Sinks", or truly unclassifiable products
  if (sourceType === "Other" || sourceType === "Sinks") return [];

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

  // ---- Layer 1: Exact dimension matching ----
  if (sourceDims) {
    const key = dimKey(sourceDims);
    const exactMatches = dimIndex.get(key) || [];

    for (const candidate of exactMatches) {
      const candidateType = getNormalizedType(candidate);
      const seriesMatch = !!(sourceCollection &&
        candidate.collection?.toLowerCase().trim() === sourceCollection);
      const sp = scoreMatch(
        product, candidate, sourceType, candidateType,
        sourceGeometry, true, false, seriesMatch
      );
      if (sp) addMatch(sp);
    }

    // ---- Layer 2: Fuzzy dimension matching (±2 inches) ----
    // Only on the depth dimension (front-to-back tolerance), width must be exact
    for (let delta = -2; delta <= 2; delta++) {
      if (delta === 0) continue;
      const fuzzyKey = `${sourceDims.depth + delta}x${sourceDims.width}`;
      const fuzzyMatches = dimIndex.get(fuzzyKey) || [];
      for (const candidate of fuzzyMatches) {
        const candidateType = getNormalizedType(candidate);
        const seriesMatch = !!(sourceCollection &&
          candidate.collection?.toLowerCase().trim() === sourceCollection);
        const sp = scoreMatch(
          product, candidate, sourceType, candidateType,
          sourceGeometry, true, true, seriesMatch
        );
        if (sp) addMatch(sp);
      }
    }
  }

  // ---- Layer 3: Collection/series matching ----
  // Catches products that share a design series but may not parse dimensions
  if (sourceCollection) {
    const colMatches = colIndex.get(sourceCollection) || [];
    for (const candidate of colMatches) {
      const candidateType = getNormalizedType(candidate);
      const sp = scoreMatch(
        product, candidate, sourceType, candidateType,
        sourceGeometry, false, false, true
      );
      if (sp) addMatch(sp);
    }
  }

  // ---- Layer 4: Fixtures as universal add-ons ----
  // If the source is a main shower/tub component, show fixtures
  const showFixtures = ["Shower Bases", "Shower Doors", "Shower Enclosures",
    "Bathtubs", "Showers"].includes(sourceType)
    || KIT_TYPES.has(sourceType);

  if (showFixtures) {
    for (const candidate of getCatalogProducts()) {
      const candidateType = getNormalizedType(candidate);
      if (candidateType !== "Fixtures") continue;
      if (seen.has(candidate.id)) continue;
      // Fixtures are universal — same brand preferred, but all shown
      const sameBrand = candidate.brand === product.brand;
      addMatch({
        product: candidate,
        score: sameBrand ? 55 : 40,
        matchType: sameBrand ? "fixture+brand" : "fixture",
      });
    }
  }

  // ---- Build result groups ----
  const result: CompatibleGroup[] = [];
  groupMap.forEach((scored, category) => {
    // Sort within group by score descending
    scored.sort((a, b) => b.score - a.score);
    result.push({
      category,
      products: scored.slice(0, MAX_PER_GROUP),
      totalCount: scored.length,
    });
  });

  // Sort groups: highest-scored group first, then by count
  result.sort((a, b) => {
    const aTop = a.products[0]?.score ?? 0;
    const bTop = b.products[0]?.score ?? 0;
    if (bTop !== aTop) return bTop - aTop;
    return b.totalCount - a.totalCount;
  });

  return result;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { parseDimensions, getNormalizedType, getGeometry, getDrainPosition, MAX_PER_GROUP };
