"use client";

import Link from "next/link";
import {
  Ruler,
  ArrowRight,
  Droplets,
  Square,
  Triangle,
  RectangleHorizontal,
  Accessibility,
  Wrench,
  Search,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STANDARD_SIZES = [
  { size: '32" x 32"', label: "Compact", desc: "Ideal for small bathrooms, powder rooms, and corner installations." },
  { size: '36" x 36"', label: "Standard", desc: "The most popular size. Fits standard bathroom layouts with room to move." },
  { size: '36" x 60"', label: "Spacious", desc: "Tub-replacement size. Perfect for converting a bathtub space to a walk-in shower." },
];

const SHAPES = [
  {
    name: "Square",
    icon: Square,
    dimensions: ['32" x 32"', '36" x 36"', '38" x 38"', '42" x 42"'],
    desc: "Great for corner and compact installations.",
  },
  {
    name: "Rectangular",
    icon: RectangleHorizontal,
    dimensions: ['34" x 48"', '36" x 48"', '36" x 60"', '34" x 60"', '36" x 72"'],
    desc: "Most versatile shape, fits standard alcove openings and tub replacements.",
  },
  {
    name: "Neo-Angle",
    icon: Triangle,
    dimensions: ['36" x 36"', '38" x 38"', '42" x 42"'],
    desc: "Diamond-shaped for corner installations that save space.",
  },
];

const CONSIDERATIONS = [
  {
    title: "Threshold Height",
    desc: "Standard thresholds are 4-5 inches. Low-profile thresholds (1-2 inches) improve accessibility.",
  },
  {
    title: "Drain Position",
    desc: "Center drain or offset drain — check your existing plumbing to match drain location.",
  },
  {
    title: "ADA Compliance",
    desc: "ADA-compliant bases feature low thresholds, non-slip surfaces, and adequate turning radius.",
  },
];

const STEPS = [
  { icon: Ruler, title: "Measure Your Space", desc: "Measure width, depth, and height of your shower area. Account for walls, doors, and fixtures." },
  { icon: Search, title: "Consider Your Needs", desc: "Think about accessibility, user preferences, and whether you're replacing a tub." },
  { icon: Droplets, title: "Check Plumbing", desc: "Locate your drain position and water supply lines. Match the base drain to your existing plumbing." },
  { icon: Wrench, title: "Plan Installation", desc: "Determine if you need a base, walls, door, and accessories. Consider professional installation." },
];

export default function SizeGuidePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-white py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber/20 text-amber-light rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Ruler className="w-4 h-4" />
            Buying Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Your Guide to Shower Base Sizes
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Find the perfect shower base for your project. Learn about standard sizes, shapes,
            and what to consider before you buy.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-gray-600 leading-relaxed text-lg">
            A shower base (also called a shower pan or receptor) is the floor of your shower.
            It collects and channels water to the drain. Choosing the right size ensures a
            proper fit, efficient drainage, and a comfortable showering experience. Whether
            you&apos;re building new or replacing an old tub, understanding standard sizes will
            help you make the right choice.
          </p>
        </div>
      </section>

      {/* Key Terminology */}
      <section className="py-16 bg-surface-sunken">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Terminology</h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { term: "Shower Base / Pan", def: "The waterproof floor unit that sits at the bottom of your shower, channeling water to the drain." },
              { term: "Shower Receptor", def: "Another term for shower base, often used in commercial or accessibility contexts." },
              { term: "Threshold", def: "The raised edge at the shower entry that contains water. Height varies from low-profile (1\") to standard (4-5\")." },
            ].map((item) => (
              <div key={item.term} className="bg-white rounded-xl p-6 shadow-card border border-border-subtle">
                <h3 className="font-semibold text-navy-800 mb-2">{item.term}</h3>
                <p className="text-sm text-gray-600">{item.def}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Standard Sizes */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Standard Sizes Overview</h2>
          <p className="text-gray-500 text-center mb-10 max-w-xl mx-auto">The most common shower base dimensions you&apos;ll encounter</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {STANDARD_SIZES.map((s) => (
              <div key={s.size} className="bg-gradient-to-br from-navy to-navy-light text-white rounded-2xl p-6">
                <p className="text-amber text-3xl font-bold mb-1">{s.size}</p>
                <p className="text-white/80 font-medium mb-3">{s.label}</p>
                <p className="text-white/60 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/products?category=Shower+Bases">
              <Button variant="amber">
                Shop Shower Bases <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Shapes & Sizes */}
      <section className="py-16 bg-surface-sunken">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Shower Base Shapes & Sizes</h2>
          <p className="text-gray-500 text-center mb-10">Different shapes for different spaces</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SHAPES.map((shape) => {
              const Icon = shape.icon;
              return (
                <div key={shape.name} className="bg-white rounded-xl p-6 shadow-card border border-border-subtle">
                  <div className="w-12 h-12 rounded-lg bg-navy/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-navy" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{shape.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{shape.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {shape.dimensions.map((d) => (
                      <span key={d} className="text-xs bg-gray-100 text-gray-700 rounded-full px-2.5 py-1 font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Measurements */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Additional Measurements to Consider</h2>
          <p className="text-gray-500 text-center mb-10">Beyond length and width, these factors matter</p>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {CONSIDERATIONS.map((c) => (
              <div key={c.title} className="flex gap-3">
                <div className="mt-1">
                  <Accessibility className="w-5 h-5 text-amber" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{c.title}</h3>
                  <p className="text-sm text-gray-600">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Choose */}
      <section className="py-16 bg-surface-sunken">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">How to Choose the Right Size</h2>
          <p className="text-gray-500 text-center mb-10">Follow these four steps</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="bg-white rounded-xl p-6 shadow-card border border-border-subtle text-center">
                  <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-amber font-bold text-sm">{i + 1}</span>
                  </div>
                  <Icon className="w-8 h-8 text-navy mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="gradient-hero rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-16 text-center text-white relative overflow-hidden texture-noise">
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-amber/25 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-amber" />
              </div>
              <h2 className="text-2xl md:text-display-lg text-white mb-4">Ready to Find Your Shower Base?</h2>
              <p className="text-white/80 mb-10 max-w-lg mx-auto leading-relaxed">
                Browse our full catalog of shower bases with detailed specifications
                and dimensions to find the perfect fit.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/products?category=Shower+Bases">
                  <Button variant="amber" size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    Shop Shower Bases
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/products">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border border-white/30 text-white hover:bg-white/10 hover:border-white/40"
                  >
                    Browse All Products
                  </Button>
                </Link>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/3 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/3 rounded-full translate-y-1/3 -translate-x-1/3" />
          </div>
        </div>
      </section>
    </div>
  );
}
