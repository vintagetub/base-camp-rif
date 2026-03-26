"use client";

import { useMemo } from "react";
import { type Product } from "./products";
import {
  getCompatibleProducts,
  type CompatibleGroup,
} from "./compatibility";

interface UseCompatibilityResult {
  groups: CompatibleGroup[];
  isLoading: boolean;
  source: "local";
}

export function useCompatibility(product: Product): UseCompatibilityResult {
  const groups = useMemo(() => getCompatibleProducts(product), [product]);

  return {
    groups,
    isLoading: false,
    source: "local",
  };
}
