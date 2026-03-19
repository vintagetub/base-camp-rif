import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "brand";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-navy text-white": variant === "default",
          "bg-gray-100 text-gray-700": variant === "secondary",
          "border border-gray-200 text-gray-600": variant === "outline",
          "bg-amber/10 text-amber-dark font-semibold": variant === "brand",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
