import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface SelectOptionItem {
  label: string;
  value: string;
}

interface SelectOptionsProps {
  id?: string;
  value: string;
  options: SelectOptionItem[];
  onChange: (value: string) => void;
  className?: string;
}

export default function SelectOptions({
  id,
  value,
  options,
  onChange,
  className,
}: SelectOptionsProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [menuRect, setMenuRect] = useState<{ left: number; top: number; width: number } | null>(null);
  const selected = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      // If click is outside of container AND outside of the portal menu, close
      if (
        !containerRef.current.contains(target) &&
        !(menuRef.current && menuRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    // Use 'click' instead of 'mousedown' to allow option onClick to run first
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Calculate dropdown position in viewport to escape ancestor overflow hidden
  const updateMenuRect = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuRect({ left: rect.left, top: rect.bottom + 8, width: rect.width });
  };

  useEffect(() => {
    if (open) {
      updateMenuRect();
      const onScrollOrResize = () => updateMenuRect();
      window.addEventListener("scroll", onScrollOrResize, true);
      window.addEventListener("resize", onScrollOrResize);
      return () => {
        window.removeEventListener("scroll", onScrollOrResize, true);
        window.removeEventListener("resize", onScrollOrResize);
      };
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((prev) => !prev);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        ref={buttonRef}
        className={cn(
          "w-full text-sm outline-none bg-transparent text-congress-blue-900",
          "flex items-center justify-between pr-8"
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-congress-blue-900">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-80"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && menuRect &&
        createPortal(
          <ul
            role="listbox"
            aria-labelledby={id}
            style={{
              position: "fixed",
              left: menuRect.left,
              top: menuRect.top,
              width: menuRect.width,
            }}
            ref={menuRef}
            className={cn(
              "z-[1000]",
              "bg-background border border-congress-blue-900 rounded-[1.1rem] overflow-hidden min-w-0"
            )}
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={0}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer rounded-[1.05rem]",
                    isSelected
                      ? "bg-congress-blue-600 text-white"
                      : "text-congress-blue-900 hover:bg-congress-blue-200"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onChange(opt.value);
                      setOpen(false);
                    }
                  }}
                >
                  {opt.label}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );
}
