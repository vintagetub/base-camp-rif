"use client";

import { ArrowUp } from "lucide-react";
import { CHANNEL } from "@/lib/channel";

const ABG_MENU = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "https://americanbathgroup.com/about/", external: true },
  { label: "Literature", href: "http://store.americanbathgroup.com", external: true },
  { label: "ABG Connect", href: "https://www.americanbathgroup.com/#abg-connect", external: true },
  { label: "ABGU", href: "https://university.americanbathgroup.com", external: true },
  { label: "ABG Gives", href: "http://americanbathgroupgives.com/", external: true },
  { label: "Contact Us", href: "https://americanbathgroup.com/abgconnect/contact-2/", external: true },
  { label: "Careers", href: "https://americanbathgroup.com/careers/", external: true },
];

const ABG_BRANDS = [
  { label: "All Brands", href: "https://americanbathgroup.com/about/abg-brands/" },
  { label: "Aker", href: "http://akerbymaax.com" },
  { label: "Aquarius", href: "http://aquariusproducts.com" },
  { label: "Aquatic Bath", href: "http://aquaticbath.com" },
  { label: "Bootz", href: "http://bootz.com" },
  { label: "Clarion Bath", href: "http://clarionbathware.com" },
  { label: "Comfort Designs", href: "http://comfortdesignsbathware.com" },
  { label: "Hamilton", href: "http://hamiltonbathware.com" },
  { label: "MAAX", href: "http://maax.com" },
  { label: "MAAX Spas", href: "https://www.maaxspas.com/" },
  { label: "Swan", href: "http://swanstone.com" },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-navy-950 text-white/60 pt-16 pb-8 mt-20 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber/30 to-transparent" />

      {/* Decorative geometric shapes */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/[0.02] rounded-full translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Back to top button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-xs font-medium text-white/40 hover:text-white/80 transition-colors"
          >
            Back to top
            <span className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
              <ArrowUp className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Contact */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/american-bath-group/image/upload/v1648488050/abg-graphics/logos/abg/abg-logos/svg/abg-logo-horizontal.svg"
              alt="American Bath Group"
              className="h-7 brightness-0 invert opacity-70 mb-6"
            />
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:8004437269" className="hover:text-white transition-colors">
                  (800) 443-7269
                </a>
              </li>
              <li>
                <a href="mailto:info@americanbathgroup.com" className="hover:text-white transition-colors">
                  info@americanbathgroup.com
                </a>
              </li>
            </ul>
            <div className="mt-5 flex flex-col gap-2.5 text-sm">
              <a
                href="https://www.americanbathgroup.com/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://americanbathgroup.com/privacy-rights-portal/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://res.cloudinary.com/american-bath-group/image/upload/v1685557056/websites-product-info-and-content/shared/website-icons/privacy-options.png"
                  alt="Privacy choices"
                  className="w-5 h-5"
                />
                Privacy Choices
              </a>
              <a
                href="https://americanbathgroup.com/supplier-code-of-conduct/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Supplier Code of Conduct
              </a>
            </div>
          </div>

          {/* Column 2: ABG Menu */}
          <div>
            <h4 className="text-white font-display font-bold text-label mb-5">ABG Menu</h4>
            <ul className="space-y-2.5 text-sm">
              {ABG_MENU.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ABG Brands */}
          <div>
            <h4 className="text-white font-display font-bold text-label mb-5">ABG Brands</h4>
            <ul className="space-y-2.5 text-sm">
              {ABG_BRANDS.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Made in USA/Canada */}
          <div className="flex flex-col items-center lg:items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://res.cloudinary.com/american-bath-group/image/upload/v1695411973/abg-graphics/icons/abg/made-in-icons/png/made-in-usa-canada-white.png"
              alt="Made in USA & Canada"
              className="w-28 h-auto opacity-60"
            />
            {CHANNEL.id !== "all" && (
              <p className="text-xs text-white/30 mt-5 text-center lg:text-left">
                {CHANNEL.portalName}
              </p>
            )}
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-white/10 pt-6 text-[11px] text-center text-white/30">
          &copy; {new Date().getFullYear()} American Bath Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
