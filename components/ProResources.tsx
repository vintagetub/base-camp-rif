"use client";

import Image from "next/image";
import { ExternalLink, Play, BookOpen, FileText, Wrench, ShoppingCart, Mail } from "lucide-react";
import { BRANDS, BRAND_NAMES } from "@/lib/brands";
import { CHANNEL, IS_CHANNEL_SPECIFIC, getChannelResourceUrl } from "@/lib/channel";

// Build brand resources dynamically from the channel's brand list
function getChannelBrandResources() {
  const resources: { brand: string; url: string; description: string }[] = [];

  for (const name of BRAND_NAMES) {
    const brand = BRANDS[name];
    if (!brand) continue;

    // Use channel-specific resource URL override, then fall back to brand default
    const url = getChannelResourceUrl(name, brand.resourceUrl);
    if (!url) continue;

    // Build a description based on the brand
    let description = "Product resources and documentation";
    switch (name) {
      case "Aquatic":
        description = "Product catalogs, installation guides, and spec sheets";
        break;
      case "Bootz":
        description = "Professional resources, warranty info, and technical documents";
        break;
      case "Dreamline":
        description = CHANNEL.id === "lowes"
          ? "Lowe's specific product catalog and resources"
          : CHANNEL.id === "homedepot"
            ? "Home Depot specific product catalog and resources"
            : "Product catalog and resources";
        break;
      case "MAAX":
        description = "Retail home center resources and professional guides";
        break;
      case "Mr. Steam":
        description = "Residential guides and specification documents";
        break;
      case "Swan":
        description = "Pro corner resources and product documentation";
        break;
      case "Coastal Shower Doors":
        description = "Product specifications and installation guides";
        break;
      case "American Standard":
        description = "Product specifications and professional resources";
        break;
      case "Clarion":
        description = "Product catalogs and installation documentation";
        break;
      case "Aker":
        description = "Accessible bathing resources and spec sheets";
        break;
      case "Mansfield":
        description = "Plumbing fixtures documentation and resources";
        break;
    }

    resources.push({ brand: name, url, description });
  }

  return resources;
}

export function ProResources() {
  const brandResources = getChannelBrandResources();

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
          Pro Resources
        </h1>
        <p className="text-text-secondary mt-2">
          Tools, guides, and resources to help you sell smarter
        </p>
      </div>

      {/* Meet Your Pro Team Video */}
      {CHANNEL.proTeamVideo && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
            <Play className="w-5 h-5 text-amber" />
            Meet Your Pro Team
          </h2>
          <div className={IS_CHANNEL_SPECIFIC ? "max-w-2xl" : "grid md:grid-cols-2 gap-6"}>
            {/* Primary video (always shown) */}
            <div className="bg-white rounded-2xl border border-border-subtle shadow-card overflow-hidden">
              <div className="aspect-video bg-navy-50">
                <video
                  controls
                  className="w-full h-full"
                  preload="metadata"
                  poster={CHANNEL.proTeamVideo.replace(/\.mp4$/, ".jpg").replace("/upload/", "/upload/so_0,w_800,f_auto/")}
                >
                  <source
                    src={CHANNEL.proTeamVideo}
                    type="video/mp4"
                  />
                </video>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-text-primary">
                  {CHANNEL.proTeamVideoLabel || "Pro Team"}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  Meet the ABG retail pro team{CHANNEL.id !== "all" ? ` supporting ${CHANNEL.name}` : ""}
                </p>
              </div>
            </div>

            {/* Second video only when showing all brands */}
            {!IS_CHANNEL_SPECIFIC && (
              <div className="bg-white rounded-2xl border border-border-subtle shadow-card overflow-hidden">
                <div className="aspect-video bg-navy-50">
                  <video
                    controls
                    className="w-full h-full"
                    preload="metadata"
                    poster="https://res.cloudinary.com/american-bath-group/video/upload/so_0,w_800,f_auto/v1759503905/abg-graphics/videos/abg/retail-pro/lowes/retail-pro-videos-lowes.jpg"
                  >
                    <source
                      src="https://res.cloudinary.com/american-bath-group/video/upload/v1759503905/abg-graphics/videos/abg/retail-pro/lowes/retail-pro-videos-lowes.mp4"
                      type="video/mp4"
                    />
                  </video>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-text-primary">
                    Lowe&apos;s Pro Team
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Meet the ABG retail pro team supporting Lowe&apos;s
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Brand Resources */}
      {brandResources.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber" />
            Brand Resource Pages
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {brandResources.map((resource) => {
              const brand = BRANDS[resource.brand];
              return (
                <a
                  key={resource.url}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white rounded-xl border border-border-subtle p-5 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {brand?.logo ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-border-subtle flex items-center justify-center">
                        <Image
                          src={brand.logo}
                          alt={resource.brand}
                          width={32}
                          height={32}
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: brand?.color || "#1B2A4A" }}
                      >
                        {resource.brand[0]}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-text-primary group-hover:text-navy-700 transition-colors">
                        {resource.brand}
                      </h3>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-tertiary group-hover:text-navy-700 transition-colors" />
                  </div>
                  <p className="text-sm text-text-secondary">{resource.description}</p>
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
          <Wrench className="w-5 h-5 text-amber" />
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          <a
            href="/products"
            className="bg-white rounded-xl border border-border-subtle p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center"
          >
            <FileText className="w-8 h-8 text-navy mx-auto mb-3" />
            <h3 className="font-bold text-text-primary">Browse Catalog</h3>
            <p className="text-sm text-text-secondary mt-1">
              Search products by brand, category, SKU, or UPC
            </p>
          </a>
          <a
            href="/quote"
            className="bg-white rounded-xl border border-border-subtle p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center"
          >
            <ShoppingCart className="w-8 h-8 text-navy mx-auto mb-3" />
            <h3 className="font-bold text-text-primary">Build a Quote</h3>
            <p className="text-sm text-text-secondary mt-1">
              Add products and submit a quote request to the ABG team
            </p>
          </a>
          <a
            href={`mailto:${CHANNEL.quoteEmail}`}
            className="bg-white rounded-xl border border-border-subtle p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 text-center"
          >
            <Mail className="w-8 h-8 text-navy mx-auto mb-3" />
            <h3 className="font-bold text-text-primary">Email Pro Team</h3>
            <p className="text-sm text-text-secondary mt-1">
              {CHANNEL.quoteEmail}
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}
