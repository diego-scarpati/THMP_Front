import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "cta";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary:
        "bg-primary-600 border-primary-600 text-white hover:bg-primary-700 hover:border-primary-700",
      secondary:
        "border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-100",
      ghost:
        "border-transparent text-primary-600 hover:bg-primary-50",
      cta:
        "bg-cta-500 border-cta-500 text-white hover:bg-cta-600 hover:border-cta-600",
    } satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant],
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
