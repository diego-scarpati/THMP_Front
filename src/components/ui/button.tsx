import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary:
        "border-congress-blue-900 bg-congress-blue-900 text-white hover:bg-congress-blue-500 hover:border-congress-blue-500",
      secondary:
        "border-congress-blue-900 text-congress-blue-900 hover:bg-congress-blue-50",
    } satisfies Record<NonNullable<ButtonProps["variant"]>, string>;

    return (
      <button
        className={cn(
          variants[variant],
          "transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-full w-[80%] min-w-[80px] border-2 px-5 py-2 text-xs font-semibold",
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
