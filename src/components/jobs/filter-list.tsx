import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import Filter from "../../../public/icons/filter.svg";
import FilterOff from "../../../public/icons/filter_off.svg";
import Add from "../../../public/icons/add.svg";
import FilterOption from "./filter-option";

// Enhanced interface for better type safety and cleaner configuration
interface FilterConfig {
  key: keyof FilterState;
  title: string;
  type: "select" | "text" | "date";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

interface FilterState {
  keyword: string;
  dateFrom: string;
  dateTo: string;
  approvedByAI: string;
  postedBy: string;
}

interface FilterListProps {
  onFiltersChange?: (filters: FilterState) => void;
}

const FilterList = ({ onFiltersChange }: FilterListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    dateFrom: "",
    dateTo: "",
    approvedByAI: "",
    postedBy: "",
  });
  const [keywordInput, setKeywordInput] = useState<string>(""); // Separate state for keyword input

  // Debounced keyword filter
  const debouncedKeywordUpdate = useCallback(
    debounce((keyword: string) => {
      const newFilters = {
        ...filters,
        keyword,
      };
      setFilters(newFilters);
      onFiltersChange?.(newFilters);
    }, 300),
    [filters, onFiltersChange]
  );

  // Effect to handle keyword debouncing
  useEffect(() => {
    debouncedKeywordUpdate(keywordInput);
    return () => {
      debouncedKeywordUpdate.cancel?.();
    };
  }, [keywordInput, debouncedKeywordUpdate]);

  // Filter configurations array - single source of truth
  const filterConfigs: FilterConfig[] = [
    {
      key: "keyword",
      title: "Keywords",
      type: "text",
      placeholder: "Enter keywords...",
    },
    {
      key: "dateFrom",
      title: "Date From",
      type: "date",
    },
    {
      key: "dateTo",
      title: "Date To",
      type: "date",
    },
    {
      key: "approvedByAI",
      title: "AI Approved",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
        { label: "Pending", value: "pending" },
      ],
    },
    {
      key: "postedBy",
      title: "Posted By",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Seek", value: "seek" },
      ],
    },
  ];

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === "keyword") {
      // Handle keyword input separately for debouncing
      setKeywordInput(value);
      return;
    }

    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);

    // Notify parent component immediately for non-keyword filters
    onFiltersChange?.(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {
      keyword: "",
      dateFrom: "",
      dateTo: "",
      approvedByAI: "",
      postedBy: "",
    };

    setFilters(clearedFilters);
    setKeywordInput(""); // Clear keyword input as well
    onFiltersChange?.(clearedFilters);
  };

  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout;

    const debounced = ((...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    }) as T & { cancel: () => void };

    debounced.cancel = () => {
      clearTimeout(timeout);
    };

    return debounced;
  }

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-semibold text-congress-blue-900">
            Showing # Jobs out of #
          </h3>
        </div>
        {/* Filter Header */}
        <div
          className="flex items-center justify-end gap-2 cursor-pointer min-w-[300px]"
          onClick={handleToggleExpanded}
        >
          <h3 className="text-md font-semibold text-congress-blue-900">
            Filter List
          </h3>
          {!isExpanded ? (
            <Filter
              className={cn(
                "w-6 h-6 text-congress-blue-900 transition-transform duration-200"
              )}
            />
          ) : (
            <FilterOff
              className={cn(
                "w-6 h-6 text-congress-blue-900 transition-transform duration-500"
              )}
            />
          )}
        </div>
      </div>

      {/* Expandable Filter Options */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        )}
      >
        <div
          className={cn(
            "transform transition-all duration-500 ease-out",
            isExpanded
              ? "translate-y-0 scale-y-100"
              : "-translate-y-4 scale-y-0"
          )}
          style={{
            transformOrigin: "top center",
          }}
        >
          <div className="space-y-4 mt-1">
            {/* Filter Grid - responsive layout that doesn't fill full width on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 max-w-6xl items-center">
              {/* Dynamically rendered filter options */}
              {filterConfigs.map((config) => (
                <FilterOption
                  key={config.key}
                  title={config.title}
                  type={config.type}
                  value={
                    config.key === "keyword"
                      ? keywordInput
                      : filters[config.key]
                  }
                  onChange={(value) => handleFilterChange(config.key, value)}
                  options={config.options}
                  placeholder={config.placeholder}
                  id={`filter-${config.key}`}
                />
              ))}
              {/* Clear Button */}
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex pr-3 pl-1.5 py-1.5 border border-congress-blue-900 text-congress-blue-300 rounded-full font-semibold bg-congress-blue-900 hover:bg-congress-blue-500 hover:border-congress-blue-500 hover:text-congress-blue-100 transition-colors items-center justify-center text-sm cursor-pointer"
                >
                  <Add className="w-5 h-5 inline-block rotate-45" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterList;
