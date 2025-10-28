import React from "react";
import { cn } from "@/lib/utils";
import Done from "/public/icons/done.svg";
import Cancel from "/public/icons/cancel.svg";
import Pending from "/public/icons/pending.svg";
import OpenInNew from "/public/icons/open_in_new.svg";

interface AiApprovedPillProps {
  url: string;
  approvedByAI?: "yes" | "no" | "pending";
  currentIndex?: boolean;
}

const AiApprovedViewJob = ({
  approvedByAI,
  currentIndex,
  url,
}: AiApprovedPillProps) => {
  const tooltipText =
    approvedByAI === "yes"
      ? "Approved"
      : approvedByAI === "no"
      ? "Rejected"
      : "Pending";
  return (
    <div
      className={cn(
        "flex flex-col rounded-md gap-1.5 p-[10px] font-semibold text-congress-blue-900 text-sm leading-none"
        // currentIndex ? "bg-congress-blue-400" : "bg-congress-blue-300"
      )}
    >
      <div className="w-full">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex w-full items-center justify-between px-[10px] py-[5px] border rounded-md h-fit transition-colors",
            "border-congress-blue-900 bg-congress-blue-900 text-congress-blue-300 hover:text-congress-blue-200 hover:bg-congress-blue-600 hover:border-congress-blue-600"
            // currentIndex ? "border-congress-blue-900 hover:text-congress-blue-800 hover:border-congress-blue-800 hover:bg-congress-blue-500" : "border-congress-blue-900",
          )}
        >
          <span className="">View Job</span>

          <OpenInNew className="inline-block h-4 w-4 align-middle" />
        </a>
      </div>
      <div
        className={cn(
          "group relative inline-flex px-[10px] py-[5px] items-center border gap-1.5 rounded-md w-auto h-fit text-congress-blue-900",
          "border-congress-blue-900 bg-transparent"
        )}
        title={tooltipText}
        tabIndex={0}
        aria-label={tooltipText}
      >
        <p className="">AI Approved:</p>
        <div className="flex items-center">
          {approvedByAI === "yes" ? (
            <Done className="inline-block h-4 w-4 align-middle" />
          ) : approvedByAI === "no" ? (
            <Cancel className="inline-block h-4 w-4 align-middle" />
          ) : (
            <Pending className="inline-block h-4 w-4 align-middle" />
          )}
        </div>
        {/* Tooltip bubble */}
        {/* <div
          role="tooltip"
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-congress-blue-100 text-congress-blue-900 text-[11px] leading-none shadow-md opacity-0 translate-y-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-visible:opacity-100 group-focus-visible:translate-y-0 whitespace-nowrap z-10"
        >
          {tooltipText}
        </div> */}
      </div>
    </div>
  );
};

export default AiApprovedViewJob;
