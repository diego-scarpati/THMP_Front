import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Filter from "@/icons/filter.svg";
import FilterOff from "@/icons/filter_off.svg";
import Add from "@/icons/add.svg";
import FilterOption from "./filter-option";

// Enhanced interface for better type safety and cleaner configuration
interface FilterConfig {
  key: keyof FilterState;
  title: string;
  type: "select" | "text" | "date";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface FilterState {
  keyword: string;
  dateFrom: string;
  dateTo: string;
  approvedByAI: string;
  postedBy: string;
  seen: string;
}

export const EMPTY_FILTER_STATE: FilterState = {
  keyword: "",
  dateFrom: "",
  dateTo: "",
  approvedByAI: "",
  postedBy: "",
  seen: "",
};

interface FilterListProps {
  totalJobs?: number;
  filteredJobs?: number;
  filters: FilterState;
  onFiltersChange?: (filters: FilterState) => void;
}

const FilterList = ({
  totalJobs,
  filteredJobs,
  filters,
  onFiltersChange,
}: FilterListProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

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
        { label: "Approved", value: "approve" },
        { label: "Rejected", value: "reject" },
        { label: "Pending", value: "review" },
      ],
    },
    {
      key: "postedBy",
      title: "Posted By",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "LinkedIn", value: "LinkedIn" },
        { label: "Seek", value: "Seek" },
      ],
    },
    {
      key: "seen",
      title: "Seen Status",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Seen", value: "seen" },
        { label: "Unseen", value: "unseen" },
      ],
    },
  ];

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = {
      ...draftFilters,
      [key]: value,
    };
    setDraftFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange?.(draftFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = { ...EMPTY_FILTER_STATE };

    setDraftFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-md font-semibold text-neutral-800  w-[clamp(150px,100%,300px)]">
            Showing {filteredJobs} Jobs out of {totalJobs}
          </h3>
        </div>
        {/* Filter Header */}
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors min-h-[44px] cursor-pointer"
          onClick={handleToggleExpanded}
        >
          Filter List
          {!isExpanded ? (
            <Filter
              className={cn(
                "w-6 h-6 text-neutral-600 transition-transform duration-200",
              )}
            />
          ) : (
            <FilterOff
              className={cn(
                "w-6 h-6 text-neutral-600 transition-transform duration-500",
              )}
            />
          )}
        </button>
      </div>

      {/* Expandable Filter Options */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0 mt-0",
        )}
      >
        <div
          className={cn(
            "transform transition-all duration-500 ease-out",
            isExpanded
              ? "translate-y-0 scale-y-100"
              : "-translate-y-4 scale-y-0",
          )}
          style={{
            transformOrigin: "top center",
          }}
        >
          <div className="space-y-4 mt-1">
            {/* Filter Row - horizontally scrollable on all screen sizes */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 pt-2 -mx-1 px-1">
              {/* Dynamically rendered filter options */}
              {filterConfigs.map((config) => (
                <div key={config.key} className="shrink-0">
                  <FilterOption
                    title={config.title}
                    type={config.type}
                    value={draftFilters[config.key]}
                    onChange={(value) => handleFilterChange(config.key, value)}
                    options={config.options}
                    placeholder={config.placeholder}
                    id={`filter-${config.key}`}
                  />
                </div>
              ))}
              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyFilters}
                className="shrink-0 px-3 py-1.5 text-sm font-semibold rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors min-h-[36px] cursor-pointer"
              >
                Apply
              </button>
              {/* Clear Button */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors min-h-[36px] flex items-center gap-1 cursor-pointer"
              >
                <Add className="w-4 h-4 inline-block rotate-45" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterList;
