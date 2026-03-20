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
  source: "local" | "orca";
}

export function useCompatibility(product: Product): UseCompatibilityResult {
  const localGroups = useMemo(() => getCompatibleProducts(product), [product]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!product.sku || localGroups.length >= 2) return;

    let cancelled = false;
    setIsLoading(true);

    const params = new URLSearchParams();
    if (product.basePart) params.set("parent_sku", product.basePart);
    if (product.id) params.set("unique_id", product.id);

    fetch(`/api/compatible/${encodeURIComponent(product.sku)}?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [product.sku, product.basePart, product.id, localGroups.length]);

  return {
    groups: localGroups,
    isLoading,
    source: localGroups.length > 0 ? "local" : "orca",
  };
}
