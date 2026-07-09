import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        {
          "bg-white/10 text-text-primary": variant === "default",
          "bg-success/15 text-success": variant === "success",
          "bg-warning/15 text-warning": variant === "warning",
          "bg-error/15 text-error": variant === "error",
          "bg-info/15 text-info": variant === "info",
          "border border-border text-text-secondary": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
