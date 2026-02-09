import React from "react";
import { cn } from "@/lib/utils";
import SelectOptions from "./select-options";
import PasswordEye from "../ui/password-eye";

interface FilterOptionProps {
  title: string;
  type: "select" | "text" | "password" | "date";
  value: string;
  onChange: (value: string) => void;
  options?: Array<{ label: string; value: string }>; // For select type
  placeholder?: string; // For text inputs
  id?: string; // For accessibility
  className?: string; // For custom styling
  labelBackground?: string; // For label background color
  disabled?: boolean;
  isVisible?: boolean; // For password visibility
  onClick?: () => void;
}

const FilterOption = ({
  title,
  type,
  value,
  onChange,
  options,
  placeholder,
  id,
  className,
  labelBackground,
  disabled,
  isVisible,
  onClick,
}: FilterOptionProps) => {
  const inputId = id || `filter-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={cn(
        "min-w-0 relative xs:max-w-[9.375rem] sm:max-w-[14rem] md:max-w-[14rem] lg:max-w-[16rem] xl:max-w-[20rem]",
        className
      )}
    >
      <div className="relative border border-congress-blue-900 rounded-full px-3 py-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            "absolute -top-2 left-3 px-1 text-[0.625rem] font-semibold text-congress-blue-900 z-10",
            labelBackground ? labelBackground : "bg-background"
          )}
        >
          {title}
        </label>

        {type === "text" && (
          <input
            type={"text"}
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full text-sm outline-none bg-transparent text-congress-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        )}
        {type === "password" && (
          // <div className="flex items-center justify-between gap-2">
          //   <input
          //     type={isVisible ? "text" : "password"}
          //     id={inputId}
          //     value={value}
          //     onChange={(e) => onChange(e.target.value)}
          //     placeholder={placeholder}
          //     disabled={disabled}
          //     className={cn("flex-1 text-sm outline-none bg-transparent text-congress-blue-900 disabled:opacity-60 disabled:cursor-not-allowed", isVisible ? "w-[80%]" : "w-full")}
          //   />
          //   <div className="">
          //   <PasswordEye
          //     isVisible={isVisible ? true : false}
          //     onClick={onClick ? onClick : () => {}}
          //   />
          //   </div>
          // </div>
          <div className="flex items-center justify-between gap-2">
            <input
              type={isVisible ? "text" : "password"}
              id={inputId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className="flex-1 text-sm outline-none bg-transparent text-congress-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <div onClick={(e) => e.stopPropagation()}>
              <PasswordEye
                isVisible={isVisible ? true : false}
                onClick={onClick ? onClick : () => {}}
              />
            </div>
          </div>
        )}
        {type === "date" && (
          <input
            type="date"
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="w-full text-sm outline-none bg-transparent text-congress-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
          />
        )}
        {type === "select" && options && (
          <SelectOptions
            id={inputId}
            value={value}
            options={options}
            onChange={onChange}
          />
        )}
      </div>
    </div>
  );
};

export default FilterOption;
