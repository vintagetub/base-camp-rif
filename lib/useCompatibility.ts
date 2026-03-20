"use client";

import { useState, useEffect, useMemo } from "react";
import { type Product } from "./products";
import {
  getCompatibleProducts,
  type CompatibleGroup,
} from "./compatibility";

interface UseCompatibilityResult {
  groups: CompatibleGroup[];
  isLoading: boolean;
  source: "local" | "orca" | "hybrid";
}

export function useCompatibility(product: Product): UseCompatibilityResult {
  // Always compute local matches synchronously (instant)
  const localGroups = useMemo(
    () => getCompatibleProducts(product),
    [product]
  );

  // Orca API is optional enhancement — don't block on it
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only call Orca if we have a SKU and local results are thin
    if (!product.sku || localGroups.length >= 2) return;

    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (product.basePart) params.set("parent_sku", product.basePart);
    if (product.id) params.set("unique_id", product.id);

    fetch(
      `/api/compatible/${encodeURIComponent(product.sku)}?${params}`
    )
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then(() => {
        // Orca results can be merged in later if needed
      })
      .catch(() => {
        // Orca is optional — silence errors, local results are fine
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [product.sku, product.basePart, product.id, localGroups.length]);

  return {
    groups: localGroups,
    isLoading,
    source: localGroups.length > 0 ? "local" : "orca",
  };
}
