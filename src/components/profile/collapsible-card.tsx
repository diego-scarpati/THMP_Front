"use client";

import { ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  title?: string;
  defaultOpen?: boolean;
  children: ReactNode | ((args: { open: boolean }) => ReactNode);
  className?: string;
  summary?: ReactNode;
}

export function CollapsibleCard({
  title,
  defaultOpen = true,
  children,
  className,
  summary,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section
      className={cn(
        "w-full rounded-2xl border border-congress-blue-900/20 bg-white",
        className
      )}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <div className="flex min-w-0 text-sm font-semibold flex-1 items-center gap-3">
          {title && (
            <h2 className="shrink-0 text-congress-blue-900">
              {title}
            </h2>
          )}
          {summary && <div className={cn("min-w-0 flex-1", !open ? "block" : "hidden")}>{summary}</div>}
        </div>
        <Chevron open={open} />
      </button>

      <div
        id={contentId}
        className={cn(open ? "block" : "hidden", "px-4 pb-4")}
      >
        {typeof children === "function" ? children({ open }) : children}
      </div>
    </section>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "text-congress-blue-900 transition-transform",
        open ? "rotate-180" : "rotate-0"
      )}
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
