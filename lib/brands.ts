import { CHANNEL, isBrandInChannel } from "./channel";

export interface BrandInfo {
  name: string;
  slug: string;
  color: string;
  logo: string;
  website: string;
  resourceUrl?: string;
  description: string;
}

export const ALL_BRANDS: Record<string, BrandInfo> = {
  Aquatic: {
    name: "Aquatic",
    slug: "aquatic",
    color: "#0072CE",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1655908563/websites-product-info-and-content/abghospitality/content/about/who-we-are/abghospitality-trustedbrands-aquatic.jpg",
    website: "https://aquaticbath.com/",
    resourceUrl: "https://aquaticbath.com/tools-resources/resources",
    description:
      "Aquatic is a leader in bathware manufacturing, offering innovative tubs, showers, and accessible bathing solutions. Known for quality construction and design versatility.",
  },
  Bootz: {
    name: "Bootz",
    slug: "bootz",
    color: "#C8102E",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1655908015/websites-product-info-and-content/abghospitality/content/about/who-we-are/abghospitality-trustedbrands-bootz.jpg",
    website: "https://bootz.com/",
    resourceUrl: "https://bootz.com/professionals-page",
    description:
      "Bootz Industries is America's leading manufacturer of porcelain enameled steel bathtubs and shower products, providing durable and affordable solutions.",
  },
  "Coastal Shower Doors": {
    name: "Coastal Shower Doors",
    slug: "coastal-shower-doors",
    color: "#0077B6",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1765900545/abg-graphics/logos/coastal-shower-doors/coastal-shower-doors-logo.jpg",
    website: "https://coastalshowerdoors.com/",
    resourceUrl: "https://coastalshowerdoors.com/resources",
    description:
      "Coastal Shower Doors offers a wide selection of frameless and semi-frameless shower enclosures with clean modern designs and quality craftsmanship.",
  },
  Dreamline: {
    name: "Dreamline",
    slug: "dreamline",
    color: "#1B365D",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1655908979/websites-product-info-and-content/abghospitality/content/about/who-we-are/abghospitality-trustedbrands-dreamline.jpg",
    website: "https://dreamline.com/",
    resourceUrl: "https://homedepot.dreamline.com/",
    description:
      "DreamLine is a leading manufacturer of shower doors, shower enclosures, and shower bases. Known for elegant designs and easy installation.",
  },
  MAAX: {
    name: "MAAX",
    slug: "maax",
    color: "#E31837",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1627357770/websites-product-info-and-content/abghospitality/content/about/who-we-are/abghospitality-trustedbrands-maax.jpg",
    website: "https://maax.com/",
    resourceUrl: "https://maax.com/pros-corner/professionals/retail-home-centers",
    description:
      "MAAX is a leading North American manufacturer of bathroom products including bathtubs, showers, and shower doors with a focus on design and innovation.",
  },
  Swan: {
    name: "Swan",
    slug: "swan",
    color: "#00573F",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1655908203/websites-product-info-and-content/abghospitality/content/about/who-we-are/abghospitality-trustedbrands-swan.jpg",
    website: "https://swanstone.com/",
    resourceUrl: "https://swanstone.com/pros-corner/resources",
    description:
      "Swan (Swanstone) manufactures premium solid surface bath and kitchen products. Their durable, easy-to-maintain products are a favorite among professionals.",
  },
  "American Standard": {
    name: "American Standard",
    slug: "american-standard",
    color: "#003DA5",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1765900545/abg-graphics/logos/american-standard-bathing/rgb/jpeg/american-standard-bathing-logo-stacked.jpg",
    website: "https://www.americanstandard.com/",
    description:
      "American Standard is an iconic brand in the bath industry, offering a comprehensive range of bathtubs, showers, and bathroom fixtures trusted by professionals.",
  },
  Clarion: {
    name: "Clarion",
    slug: "clarion",
    color: "#6C2DC7",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1652119892/websites-product-info-and-content/abg-university/content/common/Clarion/clarion-1080x907.jpg",
    website: "#",
    description:
      "Clarion Bathware manufactures high-quality fiberglass and acrylic bath products including tubs, showers, and wall systems designed for easy installation.",
  },
  Aker: {
    name: "Aker",
    slug: "aker",
    color: "#2D5F2D",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1628115293/websites-product-info-and-content/aker/content/pros-corner/tools-resources/advertising-toolkit/aker-by-maax-logo-color.jpg",
    website: "#",
    description:
      "Aker by MAAX offers a wide selection of accessible bathing solutions and shower products designed for comfort, safety, and style.",
  },
  Mansfield: {
    name: "Mansfield",
    slug: "mansfield",
    color: "#01579B",
    logo: "",
    website: "https://www.mansfieldplumbing.com/",
    description:
      "Mansfield Plumbing is an American manufacturer of plumbing fixtures including bathtubs, showers, and toilets known for durability and value.",
  },
  "Mr. Steam": {
    name: "Mr. Steam",
    slug: "mr-steam",
    color: "#37474F",
    logo: "https://res.cloudinary.com/american-bath-group/image/upload/v1655908802/websites-product-info-and-content/abghospitality/content/about/who-we-are/abghospitality-trustedbrands-mrsteam.jpg",
    website: "https://www.mrsteam.com/",
    resourceUrl: "https://www.mrsteam.com/residential-guides-specs/",
    description:
      "Mr. Steam is the industry leader in steam shower systems, providing luxury steam bathing solutions for residential and commercial applications.",
  },
  Other: {
    name: "Other Brands",
    slug: "other",
    color: "#607D8B",
    logo: "",
    website: "#",
    description:
      "Additional bath products from various manufacturers within the American Bath Group family.",
  },
};

// ---------------------------------------------------------------------------
// Channel-filtered exports
// ---------------------------------------------------------------------------

/** Brands available in the current channel (filtered from ALL_BRANDS) */
export const BRANDS: Record<string, BrandInfo> = (() => {
  const filtered: Record<string, BrandInfo> = {};
  for (const [key, info] of Object.entries(ALL_BRANDS)) {
    if (key === "Other" || isBrandInChannel(key)) {
      filtered[key] = { ...info };
      // Apply channel-specific resource URL overrides
      if (CHANNEL.brandResourceUrls?.[key]) {
        filtered[key].resourceUrl = CHANNEL.brandResourceUrls[key];
      }
    }
  }
  return filtered;
})();

/** Brand names for the current channel (excludes "Other") */
export const BRAND_NAMES: string[] = CHANNEL.brands.filter(
  (name) => ALL_BRANDS[name] !== undefined
);

export function getBrandInfo(brandName: string): BrandInfo {
  return BRANDS[brandName] || ALL_BRANDS[brandName] || BRANDS.Other || ALL_BRANDS.Other;
}

export function getBrandBySlug(slug: string): BrandInfo | undefined {
  return Object.values(BRANDS).find((b) => b.slug === slug);
}
