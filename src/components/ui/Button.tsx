import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    let base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    let color =
      variant === "primary"
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : variant === "secondary"
        ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
        : "border border-blue-600 text-blue-700 bg-white hover:bg-blue-50";
    return (
      <button ref={ref} className={cn(base, color, className)} {...props} />
    );
  }
);
Button.displayName = "Button";
