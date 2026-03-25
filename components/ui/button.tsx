import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "secondary"
    | "destructive"
    | "amber";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/50 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          "font-[var(--font-display)]",
          {
            "bg-navy text-white hover:bg-navy-light shadow-sm hover:shadow-md": variant === "default",
            "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400":
              variant === "outline",
            "hover:bg-gray-100 text-gray-700": variant === "ghost",
            "bg-gray-100 text-gray-900 hover:bg-gray-200":
              variant === "secondary",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "bg-amber text-navy font-bold hover:bg-amber-dark hover:text-white shadow-sm hover:shadow-md":
              variant === "amber",
          },
          {
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
