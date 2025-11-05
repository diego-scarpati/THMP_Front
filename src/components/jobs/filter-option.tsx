import React from 'react'
import { cn } from "@/lib/utils";

interface FilterOptionProps {
  title: string;
  type: "select" | "text" | "date";
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ label: string; value: string }>; // For select type
  placeholder?: string; // For text inputs
  id?: string; // For accessibility
  className?: string; // For custom styling
}

const FilterOption = ({ 
  title, 
  type, 
  value, 
  onChange, 
  options, 
  placeholder,
  id,
  className 
}: FilterOptionProps) => {
  const inputId = id || `filter-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn("min-w-0 relative", className)}>
      <div className="relative border border-congress-blue-900 rounded-full px-4 py-2">
        <label 
          htmlFor={inputId} 
          className="absolute -top-2 left-3 px-1 text-xs font-semibold text-congress-blue-900 bg-background z-10"
        >
          {title}
        </label>
        {type === "text" && (
          <input
            type="text"
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-base outline-none bg-transparent text-congress-blue-900"
          />
        )}
        {type === "date" && (
          <input
            type="date"
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base outline-none bg-transparent text-congress-blue-900"
          />
        )}
        {type === "select" && options && (
          <select
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base outline-none bg-transparent text-congress-blue-900"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  )
}

export default FilterOption