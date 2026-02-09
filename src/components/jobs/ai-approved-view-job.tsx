import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Done from "@/icons/done.svg";
import Cancel from "@/icons/cancel.svg";
import Pending from "@/icons/pending.svg";
import OpenInNew from "@/icons/open_in_new.svg";

interface AiApprovedPillProps {
  url: string;
  approvedByAI?: "yes" | "no" | "pending";
  currentIndex?: boolean;
}

const AiApprovedViewJob = ({ approvedByAI, url }: AiApprovedPillProps) => {
  const tooltipText =
    approvedByAI === "yes"
      ? "Approved"
      : approvedByAI === "no"
      ? "Rejected"
      : "Pending";
  return (
    <div
      className={cn(
        "rounded-md gap-1.5 py-[10px] font-semibold text-congress-blue-900 text-sm leading-none",
        "flex xl:flex-col sm:flex-col lg:flex-row items-center",
        "w-full",
      )}
    >
      <div className="xl:w-full sm:w-full lg:w-1/2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex w-full items-center justify-between px-[10px] py-[5px] border rounded-md h-fit transition-colors",
            "border-congress-blue-900 bg-congress-blue-900 text-congress-blue-300 hover:text-congress-blue-200 hover:bg-congress-blue-600 hover:border-congress-blue-600"
          )}
        >
          <span className="">View Job</span>

          <OpenInNew className="inline-block h-4 w-4 align-middle" />
        </a>
      </div>
      <div
        className={cn(
          "group relative flex flex-row px-[10px] py-[5px] items-center border gap-1.5 rounded-md h-fit text-congress-blue-900",
          "border-congress-blue-900 bg-transparent",
          "justify-between xl:w-full sm:w-full lg:w-1/2"
        )}
        data-tooltip={"AI Approval Status: " + tooltipText}
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
      </div>
    </div>
  );
};

export default AiApprovedViewJob;
