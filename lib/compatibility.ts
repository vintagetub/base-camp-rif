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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_PER_GROUP = 6;

const KIT_TYPES = new Set([
  "Shower Door and Base",
  "Shower Door, Base and Walls",
  "Shower Enclosure and Base",
  "Shower Kit",
]);

// ---------------------------------------------------------------------------
// Bathtub Sub-Type Detection
// ---------------------------------------------------------------------------

type BathtubInstall = "alcove" | "freestanding" | "drop-in" | "corner" | "unknown";

function getBathtubInstall(p: Product): BathtubInstall {
  const name = (p.name || "").toLowerCase();
  const inst = (p.installationType || "").toLowerCase();

  if (inst === "freestanding" || /freestanding/.test(name))  return "freestanding";
  if (inst === "drop-in" || /drop.?in/.test(name))           return "drop-in";
  if (inst === "corner" || /\bcorner\b/.test(name))          return "corner";
  if (inst === "alcove" || inst === "3-wall alcove" || /alcove/.test(name)) return "alcove";

  // Default: if it has standard 60in width dims, likely alcove (most common)
  return "unknown";
}

// ---------------------------------------------------------------------------
// Installation Geometry (Shower-Side)
// ---------------------------------------------------------------------------

type Geometry = "neo-angle" | "standard";

function getGeometry(p: Product): Geometry {
  const name = (p.name || "").toLowerCase();
  if (/neo.?angle/.test(name)) return "neo-angle";
  // Corner installationType on enclosures also means neo-angle
  if ((p.installationType || "").toLowerCase() === "corner" &&
      /enclosure/i.test(p.name || "")) return "neo-angle";
  return "standard";
}

function isGeometryCompatible(a: Geometry, b: Geometry): boolean {
  if (a === "neo-angle" || b === "neo-angle") return a === b;
  return true;
}

// ---------------------------------------------------------------------------
// Product Type Normalization
// ---------------------------------------------------------------------------

function isTubDoor(p: Product): boolean {
  return /tub\s*(door|enclosure)/i.test(p.name || "");
}

function isBathtub(type: string): boolean {
  return type === "Bathtubs" || type === "Tub/Shower Combo";
}

function getNormalizedType(p: Product): string {
  // Tub door detection takes priority (they're often miscategorized)
  if (isTubDoor(p)) return "Tub Doors";

  // Use category if populated
  if (p.category && p.category !== "Uncategorized") {
    if (p.category === "Tub Door") return "Tub Doors";
    return p.category;
  }

  // Map productType
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
    "Tub Shower":                      "Tub/Shower Combo",
    "Backwall":                        "Wall",
    "Shower Head":                     "Fixtures",
    "Sinks":                           "Sinks",
    "Home Spa":                        "Bathtubs",
  };

  if (p.productType && typeMap[p.productType]) return typeMap[p.productType];
  if (p.productType) return p.productType;

  // Infer from name
  const name = p.name.toLowerCase();
  if (/tub\s*(door|enclosure)/.test(name))                     return "Tub Doors";
  if (/one.?piece\s*shower/.test(name))                        return "Showers";
  if (/shower\s*(base|pan)/.test(name))                        return "Shower Bases";
  if (/shower\s*door/.test(name))                              return "Shower Doors";
  if (/freestanding.*(?:tub|bath)/i.test(name))                return "Bathtubs";
  if (/drop.?in.*(?:tub|bath)/i.test(name))                   return "Bathtubs";
  if (/alcove.*(?:tub|bath)/i.test(name))                      return "Bathtubs";
  if (/bathtub|soaking\s*tub/.test(name))                      return "Bathtubs";
  if (/(?:tub|bath).*shower/.test(name))                       return "Tub/Shower Combo";
  if (/backwall|wall\s*(panel|system|kit)|shower\s*wall/.test(name)) return "Wall";
  if (/neo.?angle/.test(name) && /enclosure/.test(name))       return "Shower Enclosures";
  if (/enclosure/.test(name))                                  return "Shower Enclosures";
  if (/shower\s*head|faucet|showerhead|rain.*shower/.test(name)) return "Fixtures";
  if (/pedestal.*sink|vanity|\bsink\b/.test(name))             return "Sinks";

  return "Other";
}

// ---------------------------------------------------------------------------
// Compatible Types — Physical Installation Rules
// ---------------------------------------------------------------------------

/**
 * Returns the list of product types that are physically compatible
 * with the given source type. Encodes real-world installation logic.
 */
function getCompatibleTypes(sourceType: string, source: Product): string[] {
  // ---- Kit products: only suggest what they DON'T already include ----
  if (KIT_TYPES.has(sourceType)) {
    if (sourceType === "Shower Door, Base and Walls") return ["Fixtures"];
    return ["Wall", "Fixtures"];
  }

  // ---- Bathtubs: depends on installation sub-type ----
  if (isBathtub(sourceType)) {
    const install = getBathtubInstall(source);

    if (install === "alcove" || install === "unknown") {
      // Alcove tubs get tub doors + wall surrounds + fixtures
      return ["Tub Doors", "Wall", "Fixtures"];
    }
    // Freestanding, drop-in, corner tubs get fixtures only
    return ["Fixtures"];
  }

  // ---- Tub/Shower Combos: one-piece units with an open side ----
  if (sourceType === "Tub/Shower Combo") {
    return ["Tub Doors", "Fixtures"];
  }

  // ---- Tub Doors: match to alcove bathtubs only ----
  if (sourceType === "Tub Doors") {
    return ["Bathtubs", "Tub/Shower Combo"];
  }

  // ---- Shower Bases: get doors, enclosures, walls ----
  if (sourceType === "Shower Bases") {
    return ["Shower Doors", "Shower Enclosures", "Wall", "Fixtures"];
  }

  // ---- Shower Doors: match to bases and walls ----
  if (sourceType === "Shower Doors") {
    return ["Shower Bases", "Wall", "Fixtures"];
  }

  // ---- Shower Enclosures: match to bases and walls ----
  if (sourceType === "Shower Enclosures") {
    return ["Shower Bases", "Wall", "Fixtures"];
  }

  // ---- Wall Panels: work with shower bases, doors, AND alcove tubs ----
  if (sourceType === "Wall") {
    return ["Shower Bases", "Shower Doors", "Shower Enclosures", "Bathtubs"];
  }

  // ---- One-Piece Showers: might accept a door + fixtures ----
  if (sourceType === "Showers") {
    return ["Shower Doors", "Fixtures"];
  }

  // ---- Fixtures, Sinks, Other: no outgoing compatibility ----
  return [];
}

// ---------------------------------------------------------------------------
// Dimension Parsing
// ---------------------------------------------------------------------------

interface ParsedDimensions {
  depth: number;
  width: number;
}

function parseDimensions(product: Product): ParsedDimensions | null {
  // Try structured dimensions field first
  const dw = product.dimensions;
  if (dw) {
    const w = parseFloat(dw.width);
    const d = parseFloat(dw.depth);
    if (w > 0 && d > 0) {
      return { depth: Math.min(d, w), width: Math.max(d, w) };
    }
  }

  // Tub doors use range dimensions ("56-59 in.") — don't parse these as depth×width
  if (isTubDoor(product)) return null;

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
    if (a >= 20 && b >= 20 && a <= 84 && b <= 84) {
      return { depth: Math.min(a, b), width: Math.max(a, b) };
    }
  }

  return null;
}

function dimKey(dims: ParsedDimensions): string {
  return `${dims.depth}x${dims.width}`;
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
  if (candidate.id === source.id) return null;
  if (candidateType === sourceType && !isBathtub(sourceType)) return null;

  // Must be in the allowed compatibility list
  const compatTypes = getCompatibleTypes(sourceType, source);
  if (!compatTypes.includes(candidateType)) return null;

  // Geometry constraint: neo-angle only matches neo-angle
  const candidateGeometry = getGeometry(candidate);
  if (!isGeometryCompatible(sourceGeometry, candidateGeometry)) return null;

  // Bathtub sub-type constraint for tub doors:
  // Tub doors only work with ALCOVE bathtubs (not freestanding/drop-in)
  if (candidateType === "Tub Doors" && isBathtub(sourceType)) {
    const install = getBathtubInstall(source);
    if (install !== "alcove" && install !== "unknown") return null;
  }
  if (sourceType === "Tub Doors" && isBathtub(candidateType)) {
    const install = getBathtubInstall(candidate);
    if (install !== "alcove" && install !== "unknown") return null;
  }

  // Wall panels for bathtubs: only alcove tubs get wall panels
  if (candidateType === "Wall" && isBathtub(sourceType)) {
    const install = getBathtubInstall(source);
    if (install !== "alcove" && install !== "unknown") return null;
  }

  // Scoring
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

  if (fuzzy) {
    score -= 10;
    matchType = "fuzzy-" + matchType;
  }
  if (candidate.brand === source.brand) score = Math.min(100, score + 5);
  if (sourceGeometry === "neo-angle" && candidateGeometry === "neo-angle" && dimMatch) {
    score = Math.min(100, score + 5);
  }

  return { product: candidate, score, matchType };
}

// ---------------------------------------------------------------------------
// Tub Door ↔ Alcove Bathtub Matching
// ---------------------------------------------------------------------------

/**
 * All tub doors in the catalog fit standard 60-inch alcove tubs.
 * This function handles the special matching since tub doors don't
 * have standard depth×width dimensions.
 */
function matchTubDoorsAndTubs(
  source: Product,
  sourceType: string,
  seen: Set<string>,
  addMatch: (sp: ScoredProduct) => void,
) {
  const allProducts = getCatalogProducts();

  if (sourceType === "Tub Doors") {
    // Source is a tub door → find alcove bathtubs with ~60in width
    for (const candidate of allProducts) {
      if (seen.has(candidate.id)) continue;
      const candType = getNormalizedType(candidate);
      if (!isBathtub(candType)) continue;
      const install = getBathtubInstall(candidate);
      if (install !== "alcove" && install !== "unknown") continue;

      // Check width is ~60 inches
      const dims = parseDimensions(candidate);
      if (dims && (dims.width < 55 || dims.width > 62)) continue;

      const sameBrand = candidate.brand === source.brand;
      addMatch({
        product: candidate,
        score: sameBrand ? 80 : 70,
        matchType: sameBrand ? "tub-door+brand" : "tub-door",
      });
    }
  } else if (isBathtub(sourceType)) {
    // Source is an alcove bathtub → find tub doors
    const install = getBathtubInstall(source);
    if (install !== "alcove" && install !== "unknown") return;

    const sourceDims = parseDimensions(source);
    // Only match if bathtub is standard width (~60in)
    if (sourceDims && (sourceDims.width < 55 || sourceDims.width > 62)) return;

    for (const candidate of allProducts) {
      if (seen.has(candidate.id)) continue;
      if (!isTubDoor(candidate)) continue;

      const sameBrand = candidate.brand === source.brand;
      addMatch({
        product: candidate,
        score: sameBrand ? 80 : 70,
        matchType: sameBrand ? "tub-door+brand" : "tub-door",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Main API
// ---------------------------------------------------------------------------

export function getCompatibleProducts(product: Product): CompatibleGroup[] {
  const sourceType = getNormalizedType(product);
  const sourceDims = parseDimensions(product);
  const sourceGeometry = getGeometry(product);
  const sourceCollection = product.collection?.toLowerCase().trim() || "";

  // Don't try to match unmatchable types
  if (["Other", "Sinks", "Fixtures", "Shower System"].includes(sourceType)) return [];

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

    // ---- Layer 2: Fuzzy dimension matching (±2 on depth only, width must be exact) ----
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

  // ---- Layer 3: Tub door ↔ alcove bathtub matching (special) ----
  matchTubDoorsAndTubs(product, sourceType, seen, addMatch);

  // ---- Layer 4: Collection/series matching ----
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

  // ---- Layer 5: Fixtures as universal add-ons ----
  const showFixtures = [
    "Shower Bases", "Shower Doors", "Shower Enclosures",
    "Bathtubs", "Showers", "Tub/Shower Combo",
  ].includes(sourceType) || KIT_TYPES.has(sourceType);

  if (showFixtures) {
    for (const candidate of getCatalogProducts()) {
      const candidateType = getNormalizedType(candidate);
      if (candidateType !== "Fixtures") continue;
      if (seen.has(candidate.id)) continue;
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
    scored.sort((a, b) => b.score - a.score);
    result.push({
      category,
      products: scored.slice(0, MAX_PER_GROUP),
      totalCount: scored.length,
    });
  });

  // Sort groups: highest-scored first, then by count
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

export { parseDimensions, getNormalizedType, getGeometry, getBathtubInstall, MAX_PER_GROUP };
export type { ParsedDimensions, Geometry, BathtubInstall };
