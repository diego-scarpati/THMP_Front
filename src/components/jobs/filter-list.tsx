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
          <h3 className="text-md font-semibold text-congress-blue-900  w-[clamp(150px,100%,300px)]">
            Showing {filteredJobs} Jobs out of {totalJobs}
          </h3>
        </div>
        {/* Filter Header */}
        <div
          className="flex items-center justify-end gap-2 cursor-pointer min-w-[100px]"
          onClick={handleToggleExpanded}
        >
          <h3 className="text-md font-semibold text-congress-blue-900">
            Filter List
          </h3>
          {!isExpanded ? (
            <Filter
              className={cn(
                "w-6 h-6 text-congress-blue-900 transition-transform duration-200",
              )}
            />
          ) : (
            <FilterOff
              className={cn(
                "w-6 h-6 text-congress-blue-900 transition-transform duration-500",
              )}
            />
          )}
        </div>
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
            {/* Filter Grid - responsive layout that doesn't fill full width on large screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-2 max-w-6xl items-center">
              {/* Dynamically rendered filter options */}
              {filterConfigs.map((config) => (
                <FilterOption
                  key={config.key}
                  title={config.title}
                  type={config.type}
                  value={draftFilters[config.key]}
                  onChange={(value) => handleFilterChange(config.key, value)}
                  options={config.options}
                  placeholder={config.placeholder}
                  id={`filter-${config.key}`}
                />
              ))}
              {/* Apply Button */}
              <div className="flex flex-row gap-2">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={handleApplyFilters}
                    className="flex px-3 py-1.5 border border-congress-blue-900 text-congress-blue-300 rounded-full font-semibold bg-congress-blue-900 hover:bg-congress-blue-500 hover:border-congress-blue-500 hover:text-congress-blue-100 transition-colors items-center justify-center text-sm cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
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
    </div>
  );
};

export default FilterList;
