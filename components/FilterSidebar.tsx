"use client";

import { useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ChevronDown,
  X,
  SlidersHorizontal,
  Accessibility,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import type { FilterOptions } from "@/lib/products";

interface FilterSidebarProps {
  brands: { name: string; count: number }[];
  categories: { name: string; count: number }[];
  colors: string[];
  installationTypes: string[];
  finishes: string[];
  frameTypes: string[];
  glassTypes: string[];
  sizes: { label: string; count: number }[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  totalResults: number;
}

function CheckboxFilter({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <div className={cn(
        "w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all duration-200",
        checked
          ? "bg-navy border-navy"
          : "border-gray-300 group-hover:border-navy/50"
      )}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[11px] text-gray-400 tabular-nums font-medium">
          {count}
        </span>
      )}
    </label>
  );
}

function ToggleFilter({
  label,
  icon: Icon,
  checked,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
        checked
          ? "bg-navy/10 border-navy/30 text-navy"
          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      <div
        className={cn(
          "w-9 h-5 rounded-full transition-colors relative",
          checked ? "bg-navy" : "bg-gray-300"
        )}
      >
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </div>
    </button>
  );
}

function AccordionSection({
  value,
  title,
  activeCount,
  children,
}: {
  value: string;
  title: string;
  activeCount?: number;
  children: React.ReactNode;
}) {
  return (
    <Accordion.Item value={value} className="border-b border-gray-200">
      <Accordion.Header>
        <Accordion.Trigger className="flex items-center justify-between w-full py-3.5 text-sm font-semibold text-gray-800 hover:text-navy transition-colors group">
          <span className="flex items-center gap-2 font-display">
            {title}
            {activeCount !== undefined && activeCount > 0 && (
              <span className="bg-navy text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] leading-none font-bold">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="pb-3 space-y-1.5">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

export function FilterSidebar({
  brands,
  categories,
  colors,
  installationTypes,
  finishes,
  frameTypes,
  glassTypes,
  sizes,
  filters,
  onFilterChange,
  totalResults,
}: FilterSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleArrayFilter = (
    key:
      | "brands"
      | "categories"
      | "colors"
      | "installationTypes"
      | "finishes"
      | "frameTypes"
      | "glassTypes",
    value: string,
    checked: boolean
  ) => {
    const current = filters[key] || [];
    const next = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    onFilterChange({ ...filters, [key]: next });
  };

  const toggleSizeFilter = (value: string, checked: boolean) => {
    const current = filters.sizes || [];
    const next = checked
      ? [...current, value]
      : current.filter((v) => v !== value);
    onFilterChange({ ...filters, sizes: next });
  };

  const activeFilterCount =
    (filters.brands?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.installationTypes?.length || 0) +
    (filters.finishes?.length || 0) +
    (filters.frameTypes?.length || 0) +
    (filters.glassTypes?.length || 0) +
    (filters.sizes?.length || 0) +
    (filters.hasImages ? 1 : 0) +
    (filters.adaOnly ? 1 : 0) +
    (filters.hasVideo ? 1 : 0);

  const clearAll = () => {
    onFilterChange({
      search: filters.search,
      sort: filters.sort,
    });
  };

  const defaultOpen = ["brand", "category"];

  const filterContent = (
    <>
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-1">
          <span className="text-sm text-gray-600 font-medium">
            {activeFilterCount} active
          </span>
          <button
            onClick={clearAll}
            className="text-sm text-navy hover:text-amber-dark font-semibold transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      <Accordion.Root
        type="multiple"
        defaultValue={defaultOpen}
        className="w-full"
      >
        {/* Brand */}
        <AccordionSection value="brand" title="Brand" activeCount={filters.brands?.length || 0}>
          {brands
            .filter((b) => b.name !== "Other")
            .map((brand) => (
              <CheckboxFilter
                key={brand.name}
                label={brand.name}
                count={brand.count}
                checked={filters.brands?.includes(brand.name) || false}
                onChange={(checked) =>
                  toggleArrayFilter("brands", brand.name, checked)
                }
              />
            ))}
        </AccordionSection>

        {/* Category */}
        <AccordionSection value="category" title="Category" activeCount={filters.categories?.length || 0}>
          {categories
            .filter((c) => c.name !== "Uncategorized")
            .map((cat) => (
              <CheckboxFilter
                key={cat.name}
                label={cat.name}
                count={cat.count}
                checked={filters.categories?.includes(cat.name) || false}
                onChange={(checked) =>
                  toggleArrayFilter("categories", cat.name, checked)
                }
              />
            ))}
        </AccordionSection>

        {/* Finish */}
        {finishes.length > 0 && (
          <AccordionSection value="finish" title="Finish" activeCount={filters.finishes?.length || 0}>
            {finishes.map((finish) => (
              <CheckboxFilter
                key={finish}
                label={finish}
                checked={filters.finishes?.includes(finish) || false}
                onChange={(checked) =>
                  toggleArrayFilter("finishes", finish, checked)
                }
              />
            ))}
          </AccordionSection>
        )}

        {/* Frame Type */}
        {frameTypes.length > 0 && (
          <AccordionSection value="frameType" title="Frame Type" activeCount={filters.frameTypes?.length || 0}>
            {frameTypes.map((type) => (
              <CheckboxFilter
                key={type}
                label={type}
                checked={filters.frameTypes?.includes(type) || false}
                onChange={(checked) =>
                  toggleArrayFilter("frameTypes", type, checked)
                }
              />
            ))}
          </AccordionSection>
        )}

        {/* Glass Type */}
        {glassTypes.length > 0 && (
          <AccordionSection value="glassType" title="Glass Type" activeCount={filters.glassTypes?.length || 0}>
            {glassTypes.map((type) => (
              <CheckboxFilter
                key={type}
                label={type}
                checked={filters.glassTypes?.includes(type) || false}
                onChange={(checked) =>
                  toggleArrayFilter("glassTypes", type, checked)
                }
              />
            ))}
          </AccordionSection>
        )}

        {/* Size (W x D) */}
        {sizes.length > 0 && (
          <AccordionSection value="size" title="Size (W x D)" activeCount={filters.sizes?.length || 0}>
            {sizes.map((s) => (
              <CheckboxFilter
                key={s.label}
                label={`${s.label}"`}
                count={s.count}
                checked={filters.sizes?.includes(s.label) || false}
                onChange={(checked) => toggleSizeFilter(s.label, checked)}
              />
            ))}
          </AccordionSection>
        )}

        {/* Color */}
        <AccordionSection value="color" title="Color" activeCount={filters.colors?.length || 0}>
          {colors.map((color) => (
            <CheckboxFilter
              key={color}
              label={color}
              checked={filters.colors?.includes(color) || false}
              onChange={(checked) =>
                toggleArrayFilter("colors", color, checked)
              }
            />
          ))}
        </AccordionSection>

        {/* Installation Type */}
        {installationTypes.length > 0 && (
          <AccordionSection value="installationType" title="Installation Type" activeCount={filters.installationTypes?.length || 0}>
            {installationTypes.map((type) => (
              <CheckboxFilter
                key={type}
                label={type}
                checked={
                  filters.installationTypes?.includes(type) || false
                }
                onChange={(checked) =>
                  toggleArrayFilter("installationTypes", type, checked)
                }
              />
            ))}
          </AccordionSection>
        )}

        {/* Options */}
        <AccordionSection value="options" title="Options">
          <CheckboxFilter
            label="Has Images"
            checked={filters.hasImages || false}
            onChange={(checked) =>
              onFilterChange({ ...filters, hasImages: checked || undefined })
            }
          />
        </AccordionSection>
      </Accordion.Root>

      {/* Toggle filters */}
      <div className="py-4 space-y-2.5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 font-display">Quick Filters</p>
        <ToggleFilter
          label="ADA Compliant"
          icon={Accessibility}
          checked={filters.adaOnly || false}
          onChange={(checked) =>
            onFilterChange({ ...filters, adaOnly: checked || undefined })
          }
        />
        <ToggleFilter
          label="Has Video"
          icon={Video}
          checked={filters.hasVideo || false}
          onChange={(checked) =>
            onFilterChange({ ...filters, hasVideo: checked || undefined })
          }
        />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="w-full rounded-xl"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-navy text-white rounded-full px-2 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-navy-950/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 shadow-drawer lg:hidden overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="font-display font-bold text-lg">Filters</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">{filterContent}</div>
            <div className="p-5 border-t border-gray-200">
              <Button
                variant="amber"
                className="w-full rounded-xl"
                onClick={() => setMobileOpen(false)}
              >
                Show {totalResults} Results
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-20 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </h2>
            <span className="text-sm text-gray-400 font-medium">
              {totalResults}
            </span>
          </div>
          {filterContent}
        </div>
      </aside>
    </>
  );
}
