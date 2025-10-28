import React from "react";
import { cn } from "@/lib/utils";

interface SkillProps {
  skill: string;
  variant?: "inactive" | "active" | "hovered";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Skill({
  skill,
  variant = "inactive",
  size = "md",
  onClick,
  className,
  disabled = false,
}: SkillProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 select-none";

  const variants = {
    inactive:
      "bg-congress-blue-100 text-congress-blue-900 hover:bg-congress-blue-200 border border-congress-blue-200",
    active:
      "bg-congress-blue-600 text-white hover:bg-congress-blue-700 border border-congress-blue-600 shadow-sm",
    hovered:
      "bg-congress-blue-600 text-white border border-congress-blue-600 shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs min-h-[28px]",
    md: "px-4 py-2 text-sm min-h-[36px]",
    lg: "px-6 py-3 text-base min-h-[44px]",
  };

  const cursorClass =
    onClick && !disabled && variant === "active"
      ? "cursor-pointer"
      : "cursor-default";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed" : "";
  // const disabledClass = disabled ? "opacity-50" : "";

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        cursorClass,
        disabledClass,
        "font-semibold",
        className
      )}
      role={onClick ? "button" : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
      onKeyDown={
        onClick && !disabled
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* <p className="sr-only">{skill}</p> */}
      <p className="">{skill}</p>
    </div>
  );
}
