"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { CHANNEL } from "@/lib/channel";
import { cn } from "@/lib/utils";

const SLIDES = [
  "https://res.cloudinary.com/american-bath-group/image/upload/t_aspect-ratio-3-1/v1759932781/abg-graphics/original-images/dreamline/shower-bases/slimline-2/jpeg/dreamline-11cr32602-shower-base-rs865-deco-w-zoom-01.jpg",
  "https://res.cloudinary.com/american-bath-group/image/upload/t_aspect-ratio-3-1/v1750690929/abg-graphics/original-images/dreamline/shower-bases-and-drains/dreamline-slimline-base-drain-kit-3232-double-threshold/jpeg/dreamline-10dn3232-88c31-base-rs820-32w-32d-c-blk-pb-deco-w-top.jpg",
  "https://res.cloudinary.com/american-bath-group/image/upload/t_aspect-ratio-3-1/v1743781892/abg-graphics/original-images/maax/multi-brand/walls-and-bases/base-roka/jpg-rgb/maax-roka-base-6036-wh-utile-calcutta-crn-rh-mb-zoom.jpg",
  "https://res.cloudinary.com/american-bath-group/image/upload/t_aspect-ratio-3-1/v1747152878/abg-graphics/original-images/maax/multi-brand/walls-and-bases/base-stonea/deco/maax-stonea-4836-mbrl-rh-utile-bora-alc-zoom.jpg",
];

export function HeroCarousel() {
  const router = useRouter();
  const [heroSearch, setHeroSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: true, stopOnMouseEnter: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const handleHeroSearch = (e: FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const accentColor = CHANNEL.accentColor || "#f59e0b";

  return (
    <section className="relative overflow-hidden">
      {/* Carousel */}
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {SLIDES.map((src, i) => (
            <div
              key={i}
              className="flex-[0_0_100%] min-w-0 relative aspect-[5/3] lg:aspect-[3/1] overflow-hidden"
            >
              {/* Ken Burns effect: slow zoom + pan on active slide */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Bath product showcase ${i + 1}`}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-out",
                  selectedIndex === i ? "scale-110" : "scale-100"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dramatic diagonal gradient overlay + vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950/85 via-navy-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(10,22,40,0.3) 100%)" }} />
      </div>

      {/* Static text overlay */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl pointer-events-auto">
            {/* Channel badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase mb-6 animate-fade-in-up"
              style={{
                backgroundColor: accentColor + "25",
                color: accentColor,
                border: `1px solid ${accentColor}40`,
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              {CHANNEL.id !== "all" ? `${CHANNEL.name} Pro Sales` : "Pro Sales Portal"}
            </div>

            <h1 className="text-display-xl text-white mb-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              The Pro Sales
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                }}
              >
                Product Catalog
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/60 mb-8 max-w-xl leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Search. Quote. Close. {CHANNEL.tagline}
            </p>

            <form onSubmit={handleHeroSearch} className="max-w-xl relative group animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <div
                className="absolute -inset-1 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20, ${accentColor}40)` }}
              />
              <div className="relative flex items-center bg-white rounded-xl shadow-elevated overflow-hidden">
                <Search className="w-5 h-5 text-gray-400 ml-5 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Search products, SKUs, brands..."
                  className="flex-1 px-4 py-4 md:py-5 text-gray-900 placeholder:text-gray-400 text-base md:text-lg bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="font-semibold px-6 md:px-8 py-4 md:py-5 transition-all shrink-0 text-sm tracking-wide uppercase"
                  style={{
                    backgroundColor: accentColor,
                    color: CHANNEL.id === "lowes" ? "#fff" : "#0A1628",
                  }}
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={scrollPrev}
        className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={scrollNext}
        className="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-105"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots — redesigned with progress bar style */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              selectedIndex === i
                ? "w-8"
                : "w-2 bg-white/40 hover:bg-white/60"
            )}
            style={selectedIndex === i ? { backgroundColor: accentColor } : undefined}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
