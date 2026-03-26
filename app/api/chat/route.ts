import { NextRequest, NextResponse } from "next/server";
import {
  filterProducts,
  getProductById,
  getProductsByBrand,
  getAllProducts,
  getRelatedProducts,
  getDescription,
  getChildVariants,
  getCatalogProducts,
  type Product,
  type FilterOptions,
} from "@/lib/products";
import { getCompatibleProducts } from "@/lib/compatibility";
import { CHANNEL, IS_CHANNEL_SPECIFIC } from "@/lib/channel";
import { BRAND_NAMES } from "@/lib/brands";
import { logInsight, extractTopics } from "@/lib/insights";

// ---------------------------------------------------------------------------
// System Prompt — Deep bath product expertise for Claude Opus
// ---------------------------------------------------------------------------

const BRAND_DESCRIPTIONS: Record<string, string> = {
  "Aquatic": "**Aquatic** — Premium bath fixtures, whirlpool and air bath systems, ADA-compliant bathing solutions, luxury freestanding tubs. Industry leader in hydrotherapy. Key collections: Everyday, Estate, Accessible.",
  "Bootz": "**Bootz Industries** — Porcelain-enameled steel bathtubs and shower bases. Budget-friendly, durable, and American-made. Top seller for affordable 60\" alcove tubs. Popular models: Aloha, Maui, Steel Enamel.",
  "Coastal Shower Doors": "**Coastal Shower Doors** — Frameless and semi-frameless shower enclosures with clean modern designs and quality craftsmanship. Popular for contemporary bathroom remodels.",
  "Dreamline": "**DreamLine** — Shower doors and enclosures — frameless, semi-frameless, and framed. Also shower bases and walls. Largest shower door selection in the industry. Known for DERA glass. Top lines: Enigma, Unidoor, Infinity-Z, Aqua, SlimLine bases.",
  "MAAX": "**MAAX** — Full bath solutions — tubs, shower doors, bases, walls/surrounds. Known for Utile wall panels, ModulR concept, and Halo doors. Canadian engineering with premium quality.",
  "Swan": "**Swan / Swanstone** — Solid surface bath products — shower walls, vanity tops, kitchen sinks. Known for Veritek technology and seamless one-piece solutions. Extremely durable solid surface material.",
  "American Standard": "**American Standard** — Iconic brand for bathtubs, toilets, faucets. Known for quality, brand recognition, and reliability. Princeton collection is a bestseller.",
  "Clarion": "**Clarion** — Fiberglass/acrylic bath fixtures at value pricing. Great for multifamily, renovation, and builder-grade projects. Reliable and affordable.",
  "Aker": "**Aker** — ADA-accessible bathing solutions by MAAX. Barrier-free showers, transfer tubs, roll-in shower bases, specialized accessibility products.",
  "Mansfield": "**Mansfield Plumbing** — Toilets, lavatories, and bath fixtures. Strong value segment with wide distribution.",
  "Mr. Steam": "**Mr. Steam** — Steam shower generators and accessories. Luxury wellness category. Leading brand in residential steam.",
};

const channelBrandDescriptions = BRAND_NAMES
  .map(name => BRAND_DESCRIPTIONS[name])
  .filter(Boolean)
  .map(desc => `• ${desc}`)
  .join("\n");

const channelContext = IS_CHANNEL_SPECIFIC
  ? `\n\nCHANNEL: This portal is specifically for ${CHANNEL.name} Pro Desk sales reps. Only recommend products from these brands: ${BRAND_NAMES.join(", ")}. Do not mention brands outside this channel.`
  : "";

const SYSTEM_PROMPT = `You are the Base Camp Product Assistant — an expert AI built for retail sales teams to find, compare, and quote bathroom products efficiently. You help sales reps build complete bathroom bids and answer product questions with deep industry knowledge.${channelContext}

YOUR ROLE:
You serve as the most knowledgeable bathroom product specialist available. You help sales reps:
• Find the right products for any bathroom project — tubs, showers, doors, fixtures, accessories
• Build complete bathroom bids by searching across all available products
• Compare products across brands, price points, and features
• Create quotes with specific product configurations
• Answer technical questions about installation, compatibility, ADA compliance, dimensions, and materials

PRODUCT KNOWLEDGE:
You have access to a comprehensive catalog of bath products from leading manufacturers:

${channelBrandDescriptions}

PRODUCT CATEGORIES:
Bathtubs (alcove, drop-in, freestanding, corner, undermount, skirted, whirlpool, air bath, soaking)
Shower Doors (sliding/bypass, pivot, hinged, neo-angle, curved, walk-in/open, tub doors, bi-fold)
Shower Bases/Pans (single threshold, barrier-free, multi-piece, neo-angle, center drain, left/right drain)
Shower Walls/Surrounds (tile panels, one-piece, multi-piece, solid surface, back wall + side panels)
Shower Enclosures (complete kits with base + walls + door)
Steam Shower Systems (generators, controls, aromatherapy, chromatherapy)
Toilets & Fixtures (toilets, lavatories, bidets, urinals)

KEY TECHNICAL KNOWLEDGE:
• ADA compliance: Barrier-free 0" threshold, grab bar reinforcement, 17-19" seat height, transfer tubs with built-in seats, roll-in accessibility, lever/paddle controls, contrasting colors
• Standard tub sizes: 60x30 (standard alcove), 60x32 (wider alcove), 60x36 (XL), 66x32, 72x36 (drop-in), 48x32 (accessible), 72x42 (luxury drop-in)
• Standard shower door openings: 44-48", 56-60" (tub doors), 34-36" (neo-angle), 44-60" (sliding), 23-36" (pivot/hinged)
• Glass types: Clear (most popular), Frosted/Obscure (privacy), Rain (textured), Tinted Grey/Bronze
• Frame types: Frameless (premium, modern), Semi-Frameless (mid-range), Framed (budget-friendly, most durable)
• Materials: Acrylic (warm, repairable), Fiberglass (budget), Porcelain-enameled steel (durable, affordable), Solid surface (premium), Tempered safety glass, Cultured marble
• Installation: Alcove (3-wall fit), Drop-in (deck/surround mount), Freestanding (no walls needed), Corner (2-wall), Neo-angle (corner with angled front), Undermount (below deck)
• Finishes: Chrome (most popular), Brushed Nickel (2nd most popular), Matte Black (trending), Oil Rubbed Bronze (traditional), Satin Brass / Polished Brass (luxury)
• Drain positions: Left, Right, Center, Reversible

BID-BUILDING APPROACH:
When a rep is building a bathroom bid, guide them through a complete solution:
1. Understand the project scope — new construction, remodel, accessibility retrofit?
2. Get the rough opening / space dimensions
3. Recommend a tub or shower base first (the anchor product)
4. Suggest compatible walls/surrounds
5. Recommend a matching shower door if applicable
6. Suggest fixtures and accessories that complement the selection
7. Use the find_compatible_products tool to ensure everything fits together
8. Build the quote incrementally — add products as they're confirmed

RECOMMENDATION STYLE:
• Present the best-fit products first based on the rep's stated needs
• When multiple brands offer equivalent products, lead with the option that offers the best value, quality, and availability combination
• Always present at least 2-3 options at different price points when possible
• Be transparent about trade-offs between products
• If a product from our catalog is a strong match, recommend it confidently
• If nothing in the catalog fits, be honest and say so

FORMATTING:
• Use **bold** for brand names, product names, key specs, and prices
• Use bullet points (•) for feature lists and spec comparisons
• Use product cards for individual product recommendations
• Use comparison tables when comparing 2+ products side by side
• Keep responses to 2-4 concise paragraphs for most queries
• Lead with the answer, then provide supporting details

PRODUCT CARD FORMAT:
:::product-card
{"id":"PRODUCT_ID","name":"Product Name","sku":"SKU","brand":"Brand","price":"123.45","image":"https://...","category":"Category"}
:::

COMPARISON TABLE FORMAT (for side-by-side product comparison):
:::comparison-table
{"products":[{"id":"ID1","name":"Name","brand":"Brand","price":"$123","specs":{"Size":"60x32","Material":"Acrylic","Installation":"Alcove"}},{"id":"ID2","name":"Name","brand":"Brand","price":"$456","specs":{"Size":"60x32","Material":"Steel","Installation":"Alcove"}}]}
:::

VARIANT ARCHITECTURE:
Products are organized with parent/child relationships:
• **Parent products** are the base product shown in the catalog (e.g., "DreamLine Enigma-X Shower Door")
• **Child variants** are specific configurations (e.g., Chrome finish, 60" width, Left drain)
• When a product has variants, search results show the parent with a variant count (e.g., "6 options")
• The add_to_quote tool can add either a parent (generic) or a specific child variant — prefer adding the specific child variant when the rep has selected a configuration

CRITICAL RULES:
• Never invent products — always search first and use real catalog data
• Always include product cards when recommending products
• When building bids, proactively suggest complementary products (a tub needs walls and possibly a door)
• You have 2,400+ product configurations across ~1,000 product families — search broadly, then narrow
• For dimension searches, try the search tool with formats like "60x32" or "60 x 32"
• When reps say "I need a quote," help them find products then add to their quote cart
• Use find_compatible_products whenever a rep has selected a base product and needs matching components
• If a rep gives a UPC or item number, immediately look it up with lookup_by_identifier`;

// ---------------------------------------------------------------------------
// Tool Definitions — 8 comprehensive tools
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    name: "search_catalog",
    description:
      "Search the ABG product catalog by keyword, brand, category, or filters. Primary tool for finding products. Use whenever a rep asks about products, needs recommendations, or wants to find something. Returns up to 12 products with summaries.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description:
            "Search query — product name, type, keyword, dimension (60x32), brand, collection, description terms, etc.",
        },
        brands: {
          type: "array",
          items: { type: "string" },
          description:
            `Filter by brands: ${BRAND_NAMES.join(", ")}`,
        },
        category: {
          type: "string",
          description:
            "Filter by category: Bathtubs, Shower Doors, Shower Bases, Shower Walls, Shower Enclosures, Toilets, etc.",
        },
        installationType: {
          type: "string",
          description:
            "Installation type: Alcove, Drop-in, Freestanding, Corner, Neo-angle, Sliding, Pivot, Hinged, Walk-in",
        },
        finish: {
          type: "string",
          description:
            "Finish: Chrome, Brushed Nickel, Matte Black, Oil Rubbed Bronze, Satin Brass",
        },
        frameType: {
          type: "string",
          description: "Frame type for doors: Frameless, Semi-Frameless, Framed",
        },
        glassType: {
          type: "string",
          description: "Glass type for doors: Clear, Frosted, Rain, Obscure, Tinted",
        },
        color: {
          type: "string",
          description: "Product color: White, Biscuit, Bone, Black, etc.",
        },
        adaOnly: {
          type: "boolean",
          description: "If true, only return ADA-compliant products",
        },
        maxPrice: {
          type: "number",
          description: "Maximum price in dollars",
        },
        minPrice: {
          type: "number",
          description: "Minimum price in dollars",
        },
        hasImages: {
          type: "boolean",
          description: "If true, only products with images",
        },
        limit: {
          type: "number",
          description: "Max results (default 12, max 20)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_product_details",
    description:
      "Get comprehensive details for a specific product by its ID. Returns full specs, dimensions, pricing, descriptions, bullets, resources (warranty docs, care guides), videos, enhanced content, and retail links. Use when a rep needs in-depth product info.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to look up",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "lookup_by_identifier",
    description:
      "Look up a product by UPC barcode, Home Depot item number, part number, base part, or SKU. Precise identifier matching — faster than general search. Use when a rep has a specific code to look up (common at the pro desk).",
    input_schema: {
      type: "object" as const,
      properties: {
        identifier: {
          type: "string",
          description:
            "The UPC, Home Depot ID, part number, base part, or SKU to look up",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: "compare_products",
    description:
      "Compare two or more products side by side. Generates a detailed comparison of specs, dimensions, pricing, features, and materials. Use when a rep wants to compare options or help a customer choose between products.",
    input_schema: {
      type: "object" as const,
      properties: {
        productIds: {
          type: "array",
          items: { type: "string" },
          description: "Array of product IDs to compare (2-6 products)",
        },
      },
      required: ["productIds"],
    },
  },
  {
    name: "find_alternatives",
    description:
      "Find alternative products similar to a given product — same category, similar specs, possibly different brand or price point. Use when a product is unavailable, too expensive, or the rep wants to see other options. Also great for cross-selling between ABG brands.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to find alternatives for",
        },
        differentBrand: {
          type: "boolean",
          description:
            "If true, prefer products from different brands (cross-brand recommendations)",
        },
        limit: {
          type: "number",
          description: "Max alternatives to return (default 6)",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "get_brand_portfolio",
    description:
      "Get a complete overview of a brand's product portfolio — categories offered, product counts, and a sample of featured products in each category. Use when a rep asks about what a brand offers or wants a brand overview.",
    input_schema: {
      type: "object" as const,
      properties: {
        brand: {
          type: "string",
          description:
            `Brand name: ${BRAND_NAMES.join(", ")}`,
        },
      },
      required: ["brand"],
    },
  },
  {
    name: "add_to_quote",
    description:
      "Add a product to the rep's current quote cart. The UI handles the cart update. Always confirm the exact product and quantity with the rep before calling this tool.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to add",
        },
        quantity: {
          type: "number",
          description: "Quantity to add (defaults to 1)",
        },
      },
      required: ["productId"],
    },
  },
  {
    name: "get_current_quote",
    description:
      "Retrieve the current quote cart status. Use when a rep asks about their quote, wants to review items, or check the total. Note: the actual cart is client-side, so this provides guidance on how to access it.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "find_compatible_products",
    description:
      "Find products that are compatible with a given product — matching shower doors for a base, walls for a tub, bases for a door, etc. Uses dimensional matching, collection matching, and brand compatibility to find the best fits. Essential for building complete bathroom bids.",
    input_schema: {
      type: "object" as const,
      properties: {
        productId: {
          type: "string",
          description: "The product ID to find compatible products for",
        },
        category: {
          type: "string",
          description:
            "Optional: filter compatible products to a specific category (e.g., 'Shower Doors', 'Shower Bases', 'Bathtubs', 'Wall')",
        },
      },
      required: ["productId"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool Execution Functions
// ---------------------------------------------------------------------------

function formatProductSummary(product: Product) {
  const price =
    product.pricing.basePrice ||
    product.pricing.listPrice ||
    product.pricing.msrp;
  return {
    id: product.id,
    name: product.shortName || product.name,
    sku: product.sku,
    brand: product.brand,
    category: product.category,
    price: price || "Quote Required",
    image: product.images[0] || "",
    color: product.color,
    installationType: product.installationType,
    dimensions: product.dimensions,
    ada: product.specifications?.ada === "Yes",
    variantCount: product.childVariantIds?.length || 0,
    variantDimensions: product.variantDimensions || [],
    isParent: product.isParent || false,
  };
}

function formatDetailedProduct(product: Product) {
  const price =
    product.pricing.basePrice ||
    product.pricing.listPrice ||
    product.pricing.msrp;
  const description = getDescription(product);

  return {
    id: product.id,
    name: product.name,
    shortName: product.shortName,
    sku: product.sku,
    brand: product.brand,
    category: product.category,
    productType: product.productType,
    collection: product.collection,
    color: product.color,
    installationType: product.installationType,
    description: description || product.description,
    bullets: product.bullets,
    images: product.images,
    dimensions: product.dimensions,
    pricing: {
      basePrice: product.pricing.basePrice || null,
      msrp: product.pricing.msrp || null,
      listPrice: product.pricing.listPrice || null,
    },
    displayPrice: price || "Quote Required",
    upc: product.upc || null,
    homeDepotId: product.homeDepotId || null,
    basePart: product.basePart || null,
    specifications: product.specifications || {},
    resources: product.resources || {},
    videos: product.videos || {},
    enhancedContent: product.enhancedContent || [],
    retailLinks: product.retailLinks || {},
    ada: product.specifications?.ada === "Yes",
    hasVideo: !!(
      product.videos &&
      Object.values(product.videos).some((v) => v)
    ),
    // Variant info
    isParent: product.isParent || false,
    parentId: product.parentId || null,
    variantCount: product.childVariantIds?.length || 0,
    variantDimensions: product.variantDimensions || [],
    variantAttributes: product.variantAttributes || null,
    childVariants: product.isParent
      ? getChildVariants(product.id).map((v) => ({
          id: v.id,
          sku: v.sku,
          attributes: v.variantAttributes || {},
          price: v.pricing.basePrice || v.pricing.listPrice || null,
        }))
      : [],
  };
}

function executeSearchCatalog(input: {
  query: string;
  brands?: string[];
  category?: string;
  installationType?: string;
  finish?: string;
  frameType?: string;
  glassType?: string;
  color?: string;
  adaOnly?: boolean;
  maxPrice?: number;
  minPrice?: number;
  hasImages?: boolean;
  limit?: number;
}) {
  const filterOptions: FilterOptions = {
    search: input.query,
    parentsOnly: true, // Show parent products + standalones only (not child variants)
  };

  if (input.brands?.length) filterOptions.brands = input.brands;
  if (input.category) filterOptions.categories = [input.category];
  if (input.installationType)
    filterOptions.installationTypes = [input.installationType];
  if (input.finish) filterOptions.finishes = [input.finish];
  if (input.frameType) filterOptions.frameTypes = [input.frameType];
  if (input.glassType) filterOptions.glassTypes = [input.glassType];
  if (input.color) filterOptions.colors = [input.color];
  if (input.adaOnly) filterOptions.adaOnly = true;
  if (input.maxPrice) filterOptions.priceMax = input.maxPrice;
  if (input.minPrice) filterOptions.priceMin = input.minPrice;
  if (input.hasImages) filterOptions.hasImages = true;

  const results = filterProducts(filterOptions);
  const limit = Math.min(input.limit || 12, 20);
  const topResults = results.slice(0, limit).map(formatProductSummary);

  // Also provide category breakdown for large result sets
  const categoryBreakdown: Record<string, number> = {};
  const brandBreakdown: Record<string, number> = {};
  results.forEach((p) => {
    if (p.category) categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    if (p.brand) brandBreakdown[p.brand] = (brandBreakdown[p.brand] || 0) + 1;
  });

  return {
    totalResults: results.length,
    showing: topResults.length,
    products: topResults,
    categoryBreakdown: results.length > limit ? categoryBreakdown : undefined,
    brandBreakdown: results.length > limit ? brandBreakdown : undefined,
  };
}

function executeGetProductDetails(input: { productId: string }) {
  const product = getProductById(input.productId);
  if (!product) {
    return { error: `Product with ID "${input.productId}" not found in the catalog.` };
  }
  return formatDetailedProduct(product);
}

function executeLookupByIdentifier(input: { identifier: string }) {
  const id = input.identifier.trim();
  const idLower = id.toLowerCase();

  const allProds = getAllProducts();

  // Exact match attempts in priority order
  const match =
    allProds.find((p) => p.sku.toLowerCase() === idLower) ||
    allProds.find((p) => p.id.toLowerCase() === idLower) ||
    allProds.find((p) => (p.upc || "").toLowerCase() === idLower) ||
    allProds.find((p) => (p.homeDepotId || "").toLowerCase() === idLower) ||
    allProds.find((p) => (p.basePart || "").toLowerCase() === idLower);

  if (match) {
    return {
      found: true,
      matchType: match.sku.toLowerCase() === idLower
        ? "sku"
        : match.id.toLowerCase() === idLower
          ? "id"
          : (match.upc || "").toLowerCase() === idLower
            ? "upc"
            : (match.homeDepotId || "").toLowerCase() === idLower
              ? "homeDepotId"
              : "basePart",
      product: formatProductSummary(match),
    };
  }

  // Partial match as fallback
  const partialMatches = allProds.filter(
    (p) =>
      p.sku.toLowerCase().includes(idLower) ||
      p.id.toLowerCase().includes(idLower) ||
      (p.upc || "").includes(id) ||
      (p.homeDepotId || "").includes(id) ||
      (p.basePart || "").toLowerCase().includes(idLower)
  );

  if (partialMatches.length > 0) {
    return {
      found: false,
      message: `No exact match for "${id}", but found ${partialMatches.length} partial matches.`,
      partialMatches: partialMatches.slice(0, 6).map(formatProductSummary),
    };
  }

  return {
    found: false,
    message: `No product found matching identifier "${id}". Try a broader search or check the number.`,
    partialMatches: [],
  };
}

function executeCompareProducts(input: { productIds: string[] }) {
  const products = input.productIds
    .map((id) => getProductById(id))
    .filter(Boolean) as Product[];

  if (products.length < 2) {
    return {
      error:
        "Need at least 2 valid product IDs to compare. Some provided IDs may not exist in the catalog.",
    };
  }

  return {
    comparisonCount: products.length,
    products: products.map((p) => {
      const price =
        p.pricing.basePrice ||
        p.pricing.listPrice ||
        p.pricing.msrp ||
        "Quote Required";
      const description = getDescription(p);
      return {
        id: p.id,
        name: p.shortName || p.name,
        sku: p.sku,
        brand: p.brand,
        category: p.category,
        collection: p.collection,
        color: p.color,
        installationType: p.installationType,
        dimensions: p.dimensions,
        price,
        specifications: p.specifications || {},
        ada: p.specifications?.ada === "Yes",
        image: p.images[0] || "",
        keyFeatures: (p.bullets || []).slice(0, 4),
        description: description ? description.slice(0, 200) : "",
        resources: {
          hasWarranty: !!(p.resources?.["Warranty Sheet - en-US"]),
          hasCareGuide: !!(p.resources?.["Use and Care"]),
        },
      };
    }),
  };
}

function executeFindAlternatives(input: {
  productId: string;
  differentBrand?: boolean;
  limit?: number;
}) {
  const product = getProductById(input.productId);
  if (!product) {
    return { error: `Product with ID "${input.productId}" not found.` };
  }

  const limit = input.limit || 6;
  const related = getRelatedProducts(product, limit + 4);

  let alternatives = related;

  // If differentBrand requested, filter and fill
  if (input.differentBrand) {
    const diffBrand = related.filter((p) => p.brand !== product.brand);
    const sameBrand = related.filter((p) => p.brand === product.brand);
    alternatives = [...diffBrand, ...sameBrand].slice(0, limit);
  } else {
    alternatives = related.slice(0, limit);
  }

  return {
    originalProduct: {
      id: product.id,
      name: product.shortName || product.name,
      brand: product.brand,
      category: product.category,
      price:
        product.pricing.basePrice ||
        product.pricing.listPrice ||
        "Quote Required",
    },
    alternatives: alternatives.map(formatProductSummary),
    totalAlternatives: alternatives.length,
  };
}

function executeGetBrandPortfolio(input: { brand: string }) {
  const brandProducts = getProductsByBrand(input.brand);

  if (brandProducts.length === 0) {
    // Try case-insensitive
    const all = getAllProducts();
    const lower = input.brand.toLowerCase();
    const matched = all.filter((p) => p.brand.toLowerCase() === lower);
    if (matched.length === 0) {
      return {
        error: `No products found for brand "${input.brand}". Available brands: ${BRAND_NAMES.join(", ")}`,
      };
    }
    return buildPortfolio(input.brand, matched);
  }

  return buildPortfolio(input.brand, brandProducts);
}

function buildPortfolio(brandName: string, products: Product[]) {
  // Category breakdown
  const categoryMap = new Map<string, Product[]>();
  products.forEach((p) => {
    const cat = p.category || "Other";
    if (!categoryMap.has(cat)) categoryMap.set(cat, []);
    categoryMap.get(cat)!.push(p);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, prods]) => ({
      category: name,
      count: prods.length,
      // Pick up to 3 featured products (prefer those with images)
      featured: prods
        .sort((a, b) => {
          const aImg = a.images.length > 0 ? 0 : 1;
          const bImg = b.images.length > 0 ? 0 : 1;
          return aImg - bImg;
        })
        .slice(0, 3)
        .map(formatProductSummary),
    }))
    .sort((a, b) => b.count - a.count);

  // Price range
  const prices = products
    .map((p) =>
      parseFloat(p.pricing.basePrice || p.pricing.listPrice || "")
    )
    .filter((n) => !isNaN(n) && n > 0);

  return {
    brand: brandName,
    totalProducts: products.length,
    categories,
    priceRange:
      prices.length > 0
        ? {
            min: Math.min(...prices).toFixed(2),
            max: Math.max(...prices).toFixed(2),
          }
        : null,
    hasAdaProducts: products.some((p) => p.specifications?.ada === "Yes"),
    productsWithImages: products.filter((p) => p.images.length > 0).length,
  };
}

function executeAddToQuote(input: { productId: string; quantity?: number }) {
  const product = getProductById(input.productId);
  if (!product) {
    return { error: `Product with ID "${input.productId}" not found.` };
  }

  const price =
    product.pricing.basePrice || product.pricing.listPrice || "";
  const qty = input.quantity || 1;

  // Build variant description if this is a child variant
  const variantDescription = product.variantAttributes
    ? Object.values(product.variantAttributes).join(", ")
    : undefined;

  // If it's a child, use parent's name for clarity
  const parentProduct = product.parentId ? getProductById(product.parentId) : null;
  const displayName = parentProduct
    ? (parentProduct.shortName || parentProduct.name)
    : (product.shortName || product.name);

  return {
    action: "add_to_quote",
    product: {
      id: product.id,
      sku: product.sku,
      name: displayName,
      brand: product.brand,
      image: product.images[0] || (parentProduct?.images[0]) || "",
      price: price,
      parentId: product.parentId || undefined,
      variantDescription,
    },
    quantity: qty,
    message: variantDescription
      ? `Added ${qty}x ${displayName} — ${variantDescription} (${product.sku}) to the quote.`
      : `Added ${qty}x ${displayName} (${product.sku}) to the quote.`,
  };
}

function executeGetCurrentQuote() {
  return {
    action: "get_current_quote",
    message:
      `The quote cart is managed in your browser. Click the cart icon in the top navigation or check the Quote page to see your current items, quantities, and total. You can also submit your quote to ${CHANNEL.quoteEmail} for confirmed pricing.`,
  };
}

function executeFindCompatible(input: { productId: string; category?: string }) {
  const product = getProductById(input.productId);
  if (!product) {
    return { error: `Product with ID "${input.productId}" not found.` };
  }

  const groups = getCompatibleProducts(product);

  const filteredGroups = input.category
    ? groups.filter(g => g.category.toLowerCase().includes(input.category!.toLowerCase()))
    : groups;

  return {
    sourceProduct: {
      id: product.id,
      name: product.shortName || product.name,
      brand: product.brand,
      category: product.category,
      dimensions: product.dimensions,
    },
    compatibleGroups: filteredGroups.map(group => ({
      category: group.category,
      totalCount: group.totalCount,
      topMatches: group.products.slice(0, 6).map(sp => ({
        ...formatProductSummary(sp.product),
        matchScore: sp.score,
        matchType: sp.matchType,
      })),
    })),
    totalCompatible: filteredGroups.reduce((sum, g) => sum + g.totalCount, 0),
  };
}

// ---------------------------------------------------------------------------
// Tool Dispatcher
// ---------------------------------------------------------------------------
function executeTool(
  name: string,
  input: Record<string, unknown>
): Record<string, unknown> {
  switch (name) {
    case "search_catalog":
      return executeSearchCatalog(
        input as Parameters<typeof executeSearchCatalog>[0]
      );
    case "get_product_details":
      return executeGetProductDetails(
        input as Parameters<typeof executeGetProductDetails>[0]
      );
    case "lookup_by_identifier":
      return executeLookupByIdentifier(
        input as Parameters<typeof executeLookupByIdentifier>[0]
      );
    case "compare_products":
      return executeCompareProducts(
        input as Parameters<typeof executeCompareProducts>[0]
      );
    case "find_alternatives":
      return executeFindAlternatives(
        input as Parameters<typeof executeFindAlternatives>[0]
      );
    case "get_brand_portfolio":
      return executeGetBrandPortfolio(
        input as Parameters<typeof executeGetBrandPortfolio>[0]
      );
    case "add_to_quote":
      return executeAddToQuote(
        input as Parameters<typeof executeAddToQuote>[0]
      );
    case "get_current_quote":
      return executeGetCurrentQuote();
    case "find_compatible_products":
      return executeFindCompatible(
        input as Parameters<typeof executeFindCompatible>[0]
      );
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ---------------------------------------------------------------------------
// Model Configuration
// ---------------------------------------------------------------------------
const MODEL = "claude-opus-4-6";

const MAX_TOOL_ROUNDS = 8;

// ---------------------------------------------------------------------------
// API Call to Claude
// ---------------------------------------------------------------------------
async function callClaude(
  messages: Array<{ role: string; content: unknown }>,
  apiKey: string,
): Promise<{
  stopReason: string;
  content: Array<{
    type: string;
    text?: string;
    id?: string;
    name?: string;
    input?: Record<string, unknown>;
    thinking?: string;
  }>;
}> {
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 16384,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: TOOLS,
    messages,
    thinking: { type: "adaptive" },
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2025-04-14",
      "anthropic-beta": "prompt-caching-2024-07-31",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Anthropic API error (${MODEL}): ${response.status} - ${errorBody}`
    );
    throw new Error(
      `Anthropic API error: ${response.status} - ${errorBody}`
    );
  }

  const data = await response.json();

  if (!data.content || !Array.isArray(data.content)) {
    console.error(
      "Unexpected API response shape:",
      JSON.stringify(data).slice(0, 500)
    );
    throw new Error("Unexpected API response: missing content array");
  }

  return {
    stopReason: data.stop_reason,
    content: data.content,
  };
}

// ---------------------------------------------------------------------------
// Main POST Handler
// ---------------------------------------------------------------------------
// Trim conversation to prevent context overflow
function trimConversation(msgs: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
  if (msgs.length <= 24) return msgs;
  const first = msgs.slice(0, 2);
  const recent = msgs.slice(-20);
  const trimNote = {
    role: "user" as const,
    content: "[Note: Earlier messages in this conversation have been summarized to save space. The conversation continues from the most recent messages below.]",
  };
  return [...first, trimNote, ...recent];
}

export async function POST(req: NextRequest) {
  // TODO: Add rate limiting per session — suggest 60 requests/minute max
  // TODO: Add request timeout — suggest 120s max for complex tool chains
  try {
    const { messages, quoteItems } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      try {
        // Trim long conversations
        const trimmedMessages = trimConversation(messages);

        // Build conversation messages — inject quote context if available
        const apiMessages: Array<{ role: string; content: unknown }> =
          trimmedMessages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          }));

        // If there are quote items, add context as the first user message enhancement
        if (quoteItems && Array.isArray(quoteItems) && quoteItems.length > 0) {
          const quoteContext = `[System context: The rep currently has ${quoteItems.length} item(s) in their quote cart: ${quoteItems.map((i: { name: string; quantity: number }) => `${i.quantity}x ${i.name}`).join(", ")}]`;
          const lastMsg = apiMessages[apiMessages.length - 1];
          if (lastMsg && lastMsg.role === "user" && typeof lastMsg.content === "string") {
            apiMessages[apiMessages.length - 1] = {
              role: "user",
              content: `${lastMsg.content}\n\n${quoteContext}`,
            };
          }
        }

        // Agentic tool-use loop
        let result = await callClaude(apiMessages, apiKey);
        const actions: Array<Record<string, unknown>> = [];
        let toolRound = 0;

        while (
          result.stopReason === "tool_use" &&
          toolRound < MAX_TOOL_ROUNDS
        ) {
          toolRound++;

          apiMessages.push({
            role: "assistant",
            content: result.content,
          });

          const toolResults: Array<{
            type: "tool_result";
            tool_use_id: string;
            content: string;
          }> = [];

          for (const block of result.content) {
            if (block.type === "tool_use" && block.id && block.name) {
              console.log(
                `[Chat] Tool call: ${block.name}(${JSON.stringify(block.input || {}).slice(0, 200)})`
              );

              const toolOutput = executeTool(
                block.name,
                (block.input as Record<string, unknown>) || {}
              );

              if (
                toolOutput.action === "add_to_quote" ||
                toolOutput.action === "get_current_quote"
              ) {
                actions.push(toolOutput);
              }

              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: JSON.stringify(toolOutput),
              });
            }
          }

          apiMessages.push({
            role: "user",
            content: toolResults,
          });

          result = await callClaude(apiMessages, apiKey);
        }

        // Extract final text (skip thinking blocks)
        const textBlocks = result.content.filter(
          (b: { type: string }) => b.type === "text"
        );
        const finalText = textBlocks
          .map((b: { text?: string }) => b.text || "")
          .join("\n")
          .trim();

        // Log conversation insights
        const toolsUsed: string[] = [];
        const productsViewed: string[] = [];
        const productsQuoted: string[] = [];
        const searchQueries: string[] = [];
        const categoriesExplored: Set<string> = new Set();
        const brandsExplored: Set<string> = new Set();

        for (const msg of apiMessages) {
          if (msg.role === "assistant" && Array.isArray(msg.content)) {
            for (const block of msg.content as Array<{ type: string; name?: string; input?: Record<string, unknown> }>) {
              if (block.type === "tool_use" && block.name) {
                toolsUsed.push(block.name);
                if (block.name === "search_catalog" && block.input?.query) searchQueries.push(block.input.query as string);
                if (block.name === "get_product_details" && block.input?.productId) productsViewed.push(block.input.productId as string);
                if (block.name === "add_to_quote" && block.input?.productId) productsQuoted.push(block.input.productId as string);
                if (block.input?.category) categoriesExplored.add(block.input.category as string);
                if (block.input?.brand) brandsExplored.add(block.input.brand as string);
                if (block.input?.brands && Array.isArray(block.input.brands)) {
                  (block.input.brands as string[]).forEach(b => brandsExplored.add(b));
                }
              }
            }
          }
        }

        const userMessages = messages.filter((m: { role: string; content: string }) => m.role === "user");
        const topics = extractTopics(userMessages);

        logInsight({
          sessionId: req.headers.get("x-session-id") || "anonymous",
          timestamp: new Date().toISOString(),
          channel: CHANNEL.id,
          messageCount: messages.length,
          toolsUsed: [...new Set(toolsUsed)],
          productsViewed,
          productsQuoted,
          categoriesExplored: Array.from(categoriesExplored),
          brandsExplored: Array.from(brandsExplored),
          searchQueries,
          bidSize: quoteItems?.length || 0,
          topics,
        });

        if (finalText) {
          console.log(
            `[Chat] Success with ${MODEL} after ${toolRound} tool rounds`
          );
          return NextResponse.json({
            message: finalText,
            actions,
            model: MODEL,
            toolRounds: toolRound,
          });
        }

        if (toolRound > 0) {
          console.warn(
            `[Chat] ${MODEL} returned no text after ${toolRound} tool rounds`
          );
          return NextResponse.json({
            message:
              "I found some results but had trouble formatting my response. Please try rephrasing your question, or browse the catalog directly.",
            actions,
            model: MODEL,
          });
        }
      } catch (err) {
        console.error(`[Chat] ${MODEL} failed:`, (err as Error).message);
      }
    }

    // -----------------------------------------------------------------
    // Fallback: keyword-based responses when API is unavailable
    // -----------------------------------------------------------------
    const lastMessage =
      messages[messages.length - 1]?.content?.toLowerCase() || "";
    let reply = "";

    if (
      lastMessage.includes("ada") ||
      lastMessage.includes("accessible") ||
      lastMessage.includes("compliant")
    ) {
      const adaResults = filterProducts({ adaOnly: true, parentsOnly: true });
      const adaSample = adaResults
        .filter((p) => p.images.length > 0)
        .slice(0, 4)
        .map(formatProductSummary);
      const cards = adaSample
        .map(
          (p) =>
            `:::product-card\n${JSON.stringify({ id: p.id, name: p.name, sku: p.sku, brand: p.brand, price: p.price, image: p.image, category: p.category })}\n:::`
        )
        .join("\n\n");
      reply = `We have **${adaResults.length} ADA-compliant** bath products. **Aquatic** and **Aker** are our top brands for accessible bathing — including barrier-free showers, transfer tubs, and grab bar-ready fixtures.\n\n${cards}`;
    } else if (
      lastMessage.includes("tub") ||
      lastMessage.includes("bathtub") ||
      lastMessage.includes("bath")
    ) {
      const tubResults = filterProducts({ search: "bathtub", parentsOnly: true });
      const tubSample = tubResults
        .filter((p) => p.images.length > 0)
        .slice(0, 4)
        .map(formatProductSummary);
      const cards = tubSample
        .map(
          (p) =>
            `:::product-card\n${JSON.stringify({ id: p.id, name: p.name, sku: p.sku, brand: p.brand, price: p.price, image: p.image, category: p.category })}\n:::`
        )
        .join("\n\n");
      reply = `Great selection of bathtubs from **Aquatic**, **Bootz**, **American Standard**, and **MAAX**. Our 60" alcove tubs are the most popular. Here are some top picks:\n\n${cards}\n\nWould you like me to narrow it down by size, installation type, or budget?`;
    } else if (
      lastMessage.includes("shower") &&
      lastMessage.includes("door")
    ) {
      const doorResults = filterProducts({ search: "shower door", parentsOnly: true });
      const doorSample = doorResults.slice(0, 4).map(formatProductSummary);
      const cards = doorSample
        .map(
          (p) =>
            `:::product-card\n${JSON.stringify({ id: p.id, name: p.name, sku: p.sku, brand: p.brand, price: p.price, image: p.image, category: p.category })}\n:::`
        )
        .join("\n\n");
      reply = `**DreamLine** is our go-to brand for shower doors — frameless, semi-frameless, and framed options in various sizes. Here are popular options:\n\n${cards}\n\nWhat size opening are you working with?`;
    } else if (
      lastMessage.includes("quote") ||
      lastMessage.includes("price")
    ) {
      reply =
        `You can build a quote by adding products using the **Add to Quote** button on any product. Once ready, go to the **Quote page** to submit it. Our team at **${CHANNEL.quoteEmail}** typically responds within one business day with confirmed pricing.`;
    } else if (lastMessage.includes("compare")) {
      reply =
        "To compare products, browse the catalog and open the products you're interested in. You can check specifications side by side on each product's **Specifications** tab. Need help finding specific products to compare?";
    } else if (
      lastMessage.includes("hello") ||
      lastMessage.includes("hi") ||
      lastMessage.includes("hey")
    ) {
      reply =
        "Hey there! I'm ready to help you find the right bath products. I can search across our full catalog of 2,400+ products, build bids, compare options, and create quotes. What are you working on?";
    } else {
      const searchResults = filterProducts({ search: lastMessage, parentsOnly: true });
      if (searchResults.length > 0) {
        const sample = searchResults.slice(0, 4).map(formatProductSummary);
        const cards = sample
          .map(
            (p) =>
              `:::product-card\n${JSON.stringify({ id: p.id, name: p.name, sku: p.sku, brand: p.brand, price: p.price, image: p.image, category: p.category })}\n:::`
          )
          .join("\n\n");
        reply = `I found **${searchResults.length} products** matching your search:\n\n${cards}\n\nWant me to narrow these down?`;
      } else {
        const brandListFormatted = BRAND_NAMES.map(b => `**${b}**`).join(", ");
        reply =
          `I can help you find bath products from our brands including ${brandListFormatted}. Try asking about specific product types, brands, or requirements like ADA compliance. You can also search by UPC${CHANNEL.id === "homedepot" ? " or Home Depot item number" : ""}.`;
      }
    }

    return NextResponse.json({ message: reply, actions: [] });
  } catch (error) {
    console.error("[Chat] Fatal error:", error);
    return NextResponse.json(
      {
        message:
          "I'm having trouble connecting right now. Please try again or browse our product catalog directly.",
        actions: [],
      },
      { status: 500 }
    );
  }
}
