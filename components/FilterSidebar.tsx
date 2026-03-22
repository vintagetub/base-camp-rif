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
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border-default text-navy focus:ring-navy cursor-pointer"
      />
      <span className="text-sm text-text-secondary group-hover:text-navy transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-text-tertiary tabular-nums">({count})</span>
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
        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border",
        checked
          ? "bg-navy/10 border-navy/30 text-navy"
          : "bg-surface border-border-subtle text-text-secondary hover:border-border-default hover:bg-surface-sunken"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1 text-left">{label}</span>
      <div
        className={cn(
          "w-8 h-5 rounded-full transition-colors relative",
          checked ? "bg-navy" : "bg-border-default"
        )}
      >
        <div
          className={cn(
            "w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform",
            checked ? "translate-x-3.5" : "translate-x-0.5"
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
    <Accordion.Item value={value} className="border-b border-border-subtle">
      <Accordion.Header>
        <Accordion.Trigger className="flex items-center justify-between w-full py-3 text-sm font-semibold text-text-primary hover:text-navy transition-colors group">
          <span className="flex items-center gap-2">
            {title}
            {activeCount !== undefined && activeCount > 0 && (
              <span className="bg-navy text-white rounded-full px-1.5 py-0.5 text-xs leading-none font-bold">
                {activeCount}
              </span>
            )}
          </span>
          <ChevronDown className="w-4 h-4 transition-transform group-data-[state=open]:rotate-180" />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
        <div className="pb-3 space-y-2">{children}</div>
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

  const activeFilterCount =
    (filters.brands?.length || 0) +
    (filters.categories?.length || 0) +
    (filters.colors?.length || 0) +
    (filters.installationTypes?.length || 0) +
    (filters.finishes?.length || 0) +
    (filters.frameTypes?.length || 0) +
    (filters.glassTypes?.length || 0) +
    (filters.hasImages ? 1 : 0) +
    (filters.adaOnly ? 1 : 0) +
    (filters.hasVideo ? 1 : 0);

  const clearAll = () => {
    onFilterChange({
      search: filters.search,
      sort: filters.sort,
    });
  };

  // Determine default open sections
  const defaultOpen = ["brand", "category"];

  const filterContent = (
    <>
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <span className="text-sm text-text-secondary">
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active
          </span>
          <button
            onClick={clearAll}
            className="text-sm text-navy hover:text-amber-dark font-medium"
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
      <div className="py-3 border-b border-border-subtle space-y-2">
        <p className="text-sm font-semibold text-text-primary mb-2">Quick Filters</p>
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
          className="w-full"
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
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-surface z-50 shadow-2xl lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">{filterContent}</div>
            <div className="p-4 border-t">
              <Button
                variant="amber"
                className="w-full"
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
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-text-primary flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </h2>
            <span className="text-sm text-text-tertiary">
              {totalResults} products
            </span>
          </div>
          {filterContent}
        </div>
      </aside>
    </>
  );
}
