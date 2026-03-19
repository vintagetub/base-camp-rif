/**
 * Channel Configuration
 *
 * Controls which brands, resources, and branding appear in the portal.
 * Set NEXT_PUBLIC_CHANNEL env var to select a channel:
 *   - "homedepot"  → Home Depot brands only
 *   - "lowes"      → Lowe's brands only
 *   - undefined     → All brands (default)
 */

export type ChannelId = "homedepot" | "lowes" | "all";

export interface ChannelConfig {
  id: ChannelId;
  name: string;
  /** Short display label for the portal */
  portalName: string;
  /** Tagline shown in hero / metadata */
  tagline: string;
  /** Brands included in this channel */
  brands: string[];
  /** Retailer-specific resource URLs per brand (overrides default) */
  brandResourceUrls?: Record<string, string>;
  /** Pro team video URL */
  proTeamVideo?: string;
  /** Pro team video label */
  proTeamVideoLabel?: string;
  /** Contact email for quotes */
  quoteEmail: string;
  /** Color theme overrides (optional) */
  accentColor?: string;
}

// ---------------------------------------------------------------------------
// Channel Definitions
// ---------------------------------------------------------------------------

const HOME_DEPOT_BRANDS = [
  "American Standard",
  "Aquatic",
  "Bootz",
  "Coastal Shower Doors",
  "Dreamline",
  "Swan",
];

const LOWES_BRANDS = [
  "MAAX",
  "Mr. Steam",
  "Clarion",
  "Aker",
  "Mansfield",
];

const ALL_BRANDS = [...HOME_DEPOT_BRANDS, ...LOWES_BRANDS];

const CHANNELS: Record<ChannelId, ChannelConfig> = {
  homedepot: {
    id: "homedepot",
    name: "Home Depot",
    portalName: "Home Depot Pro Sales Portal",
    tagline: "Your Home Depot inside sales toolkit for bath products.",
    brands: HOME_DEPOT_BRANDS,
    brandResourceUrls: {
      Dreamline: "https://homedepot.dreamline.com/",
    },
    proTeamVideo:
      "https://res.cloudinary.com/american-bath-group/video/upload/v1759504909/abg-graphics/videos/abg/retail-pro/home-depot/retail-pro-videos-hd.mp4",
    proTeamVideoLabel: "Home Depot Pro Team",
    quoteEmail: "proquote@americanbathgroup.com",
    accentColor: "#F96302", // Home Depot orange
  },
  lowes: {
    id: "lowes",
    name: "Lowe's",
    portalName: "Lowe's Pro Sales Portal",
    tagline: "Your Lowe's inside sales toolkit for bath products.",
    brands: LOWES_BRANDS,
    brandResourceUrls: {
      Dreamline: "https://lowes.dreamline.com/",
    },
    proTeamVideo:
      "https://res.cloudinary.com/american-bath-group/video/upload/v1759503905/abg-graphics/videos/abg/retail-pro/lowes/retail-pro-videos-lowes.mp4",
    proTeamVideoLabel: "Lowe's Pro Team",
    quoteEmail: "proquote@americanbathgroup.com",
    accentColor: "#004990", // Lowe's blue
  },
  all: {
    id: "all",
    name: "All Retailers",
    portalName: "ABG Pro Sales Portal",
    tagline: "Your inside sales toolkit for bath products.",
    brands: ALL_BRANDS,
    proTeamVideo:
      "https://res.cloudinary.com/american-bath-group/video/upload/v1759504909/abg-graphics/videos/abg/retail-pro/home-depot/retail-pro-videos-hd.mp4",
    proTeamVideoLabel: "Home Depot Pro Team",
    quoteEmail: "proquote@americanbathgroup.com",
  },
};

// ---------------------------------------------------------------------------
// Runtime Channel Selection
// ---------------------------------------------------------------------------

function resolveChannelId(): ChannelId {
  const env = process.env.NEXT_PUBLIC_CHANNEL?.toLowerCase();
  if (env === "homedepot" || env === "home_depot" || env === "hd") return "homedepot";
  if (env === "lowes" || env === "lowe's" || env === "lowes") return "lowes";
  return "all";
}

/** Current channel config — resolved once at build time / app startup */
export const CHANNEL: ChannelConfig = CHANNELS[resolveChannelId()];

/** Whether the site is filtered to a specific retailer (not "all") */
export const IS_CHANNEL_SPECIFIC: boolean = CHANNEL.id !== "all";

/** Check if a brand belongs to the current channel */
export function isBrandInChannel(brandName: string): boolean {
  return CHANNEL.brands.includes(brandName);
}

/** Get the resource URL for a brand, with channel-specific overrides */
export function getChannelResourceUrl(
  brandName: string,
  defaultUrl?: string
): string | undefined {
  return CHANNEL.brandResourceUrls?.[brandName] || defaultUrl;
}
