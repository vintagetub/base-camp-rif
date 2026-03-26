"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, List, ChevronDown, Search, X, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Package } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { FilterSidebar } from "./FilterSidebar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  filterProducts,
  computeFacets,
  type FilterOptions,
} from "@/lib/products";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "default", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "brand", label: "Brand: A-Z" },
  { value: "name", label: "Name: A-Z" },
];

const PAGE_SIZE = 24;

type ArrayFilterKey = "brands" | "categories" | "colors" | "installationTypes" | "finishes" | "frameTypes" | "glassTypes";

export function CatalogContent() {
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const initialSearch = searchParams.get("search") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialCategory = searchParams.get("category") || "";

  const [filters, setFilters] = useState<FilterOptions>({
    search: initialSearch,
    brands: initialBrand ? [initialBrand] : [],
    categories: initialCategory ? [initialCategory] : [],
    sort: "default",
  });

  useEffect(() => {
    const search = searchParams.get("search") || "";
    const brand = searchParams.get("brand") || "";
    const category = searchParams.get("category") || "";
    setFilters((prev) => ({
      ...prev,
      search: search || prev.search,
      brands: brand ? [brand] : prev.brands,
      categories: category ? [category] : prev.categories,
    }));
  }, [searchParams]);

  const allResults = useMemo(() => filterProducts({ ...filters, parentsOnly: true }), [filters]);
  const facets = useMemo(() => computeFacets({ ...filters, parentsOnly: true }), [filters]);
  const { brands, categories, colors, installationTypes, finishes, frameTypes, glassTypes, sizes } = facets;

  const totalPages = Math.max(1, Math.ceil(allResults.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedResults = allResults.slice(startIndex, startIndex + PAGE_SIZE);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  const goToPage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeArrayFilter = (key: ArrayFilterKey, value: string) => {
    const current = filters[key] || [];
    handleFilterChange({ ...filters, [key]: current.filter((v) => v !== value) });
  };

  const activeFilters: { key: ArrayFilterKey | "sizes" | "adaOnly" | "hasVideo"; label: string; value: string }[] = [];
  (["brands", "categories", "colors", "installationTypes", "finishes", "frameTypes", "glassTypes"] as ArrayFilterKey[]).forEach((key) => {
    (filters[key] || []).forEach((value) => {
      activeFilters.push({ key, label: value, value });
    });
  });
  (filters.sizes || []).forEach((v) => {
    activeFilters.push({ key: "sizes", label: `${v}"`, value: v });
  });
  if (filters.adaOnly) activeFilters.push({ key: "adaOnly", label: "ADA Compliant", value: "ada" });
  if (filters.hasVideo) activeFilters.push({ key: "hasVideo", label: "Has Video", value: "video" });

  const clearAllFilters = () => {
    handleFilterChange({ search: filters.search, sort: filters.sort });
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-8 overflow-hidden">
      {/* Page header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-display-lg text-text-primary">
          Product Catalog
        </h1>
        {filters.search && (
          <p className="text-text-secondary mt-2">
            Results for &ldquo;{filters.search}&rdquo;
            <button
              onClick={() => handleFilterChange({ ...filters, search: "" })}
              className="text-navy-700 ml-2 hover:underline font-semibold"
            >
              Clear search
            </button>
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        <FilterSidebar
          brands={brands}
          categories={categories}
          colors={colors}
          installationTypes={installationTypes}
          finishes={finishes}
          frameTypes={frameTypes}
          glassTypes={glassTypes}
          sizes={sizes}
          filters={filters}
          onFilterChange={handleFilterChange}
          totalResults={allResults.length}
        />

        <div className="flex-1 min-w-0">
          {/* Active filter badges */}
          {activeFilters.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-5">
              <span className="text-sm text-text-secondary font-medium">Active:</span>
              {activeFilters.map((f) => (
                <Badge
                  key={`${f.key}-${f.value}`}
                  variant="secondary"
                  className="cursor-pointer inline-flex items-center gap-1 pr-1.5 hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    if (f.key === "adaOnly") {
                      handleFilterChange({ ...filters, adaOnly: undefined });
                    } else if (f.key === "hasVideo") {
                      handleFilterChange({ ...filters, hasVideo: undefined });
                    } else if (f.key === "sizes") {
                      handleFilterChange({ ...filters, sizes: (filters.sizes || []).filter((v) => v !== f.value) });
                    } else {
                      removeArrayFilter(f.key, f.value);
                    }
                  }}
                >
                  {f.label}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-navy hover:text-amber-dark font-semibold hover:underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-2 sm:gap-3 bg-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-card border border-border-subtle">
            <p className="text-xs sm:text-sm text-text-secondary shrink-0">
              <span className="font-semibold text-text-primary">
                {allResults.length > 0 ? startIndex + 1 : 0}&ndash;{Math.min(startIndex + PAGE_SIZE, allResults.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-text-primary">
                {allResults.length.toLocaleString()}
              </span>{" "}
              <span className="hidden sm:inline">products</span>
            </p>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <select
                  value={filters.sort || "default"}
                  onChange={(e) =>
                    handleFilterChange({ ...filters, sort: e.target.value })
                  }
                  className="appearance-none bg-surface-sunken border border-border-subtle rounded-lg pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-700/30 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
              </div>

              <div className="hidden sm:flex border border-border-subtle rounded-lg overflow-hidden">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "p-2 transition-colors",
                    view === "grid"
                      ? "bg-navy text-white"
                      : "bg-white text-text-tertiary hover:bg-surface-sunken"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "p-2 transition-colors",
                    view === "list"
                      ? "bg-navy text-white"
                      : "bg-white text-text-tertiary hover:bg-surface-sunken"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          {paginatedResults.length > 0 ? (
            <>
              <div
                className={cn(
                  view === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 stagger-children"
                    : "flex flex-col gap-3 stagger-children"
                )}
              >
                {paginatedResults.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    view={view}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(1)}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-text-secondary px-4 font-medium">
                    Page <span className="font-bold text-text-primary">{currentPage}</span> of{" "}
                    <span className="font-bold text-text-primary">{totalPages}</span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="rounded-lg"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-2xl shadow-card border border-border-subtle">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-text-primary text-lg font-display font-bold mb-2">
                No products found
              </p>
              <p className="text-text-secondary text-sm mb-6 max-w-sm mx-auto">
                Try adjusting your filters or search terms to find what you&apos;re looking for
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  handleFilterChange({ search: "", sort: "default" })
                }
                className="rounded-xl"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
