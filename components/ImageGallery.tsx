"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBrandInfo } from "@/lib/brands";

interface ImageGalleryProps {
  images: string[];
  brand: string;
  productName: string;
}

export function ImageGallery({ images, brand, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const brandInfo = getBrandInfo(brand);

  if (images.length === 0) {
    return (
      <div
        className="aspect-square rounded-2xl flex flex-col items-center justify-center"
        style={{ backgroundColor: brandInfo.color + "15" }}
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-3"
          style={{ backgroundColor: brandInfo.color }}
        >
          {brand[0]}
        </div>
        <p className="text-sm font-medium" style={{ color: brandInfo.color }}>
          {brand}
        </p>
        <p className="text-xs text-gray-400 mt-1">No image available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        className="relative aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden group cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={images[selectedIndex]}
          alt={productName}
          fill
          className={cn(
            "object-contain p-6 transition-transform duration-300",
            isZoomed ? "scale-150" : "group-hover:scale-105"
          )}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized
        />
        <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-4 h-4 text-gray-600" />
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(
                  (prev) => (prev - 1 + images.length) % images.length
                );
                setIsZoomed(false);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev + 1) % images.length);
                setIsZoomed(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow hover:bg-white transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIndex(i);
                setIsZoomed(false);
              }}
              className={cn(
                "w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all",
                selectedIndex === i
                  ? "border-navy ring-2 ring-navy/20"
                  : "border-gray-200 hover:border-gray-400"
              )}
            >
              <Image
                src={img}
                alt={`${productName} view ${i + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-contain p-1"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
