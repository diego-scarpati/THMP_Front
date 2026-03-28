import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Done from "@/icons/done.svg";
import Cancel from "@/icons/cancel.svg";
import Pending from "@/icons/pending.svg";
import OpenInNew from "@/icons/open_in_new.svg";

interface AiApprovedPillProps {
  url: string;
  approvedByAI?: "approve" | "reject" | "review";
  currentIndex?: boolean;
}

const AiApprovedViewJob = ({ approvedByAI, url }: AiApprovedPillProps) => {
  const tooltipText =
    approvedByAI === "approve"
      ? "Approved"
      : approvedByAI === "reject"
      ? "Rejected"
      : "Pending";
  return (
    <div
      className={cn(
        "rounded-md gap-1.5 py-[10px] font-semibold text-neutral-800 text-sm leading-none",
        "flex xl:flex-col sm:flex-col lg:flex-row items-center",
        "w-full",
      )}
    >
      <div className="xl:w-full w-1/2 sm:w-full lg:w-1/2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex w-full items-center justify-between px-[10px] py-[5px] border rounded-md h-fit transition-colors",
            "border-cta-500 bg-cta-500 text-white hover:bg-cta-600 hover:border-cta-600"
          )}
        >
          <span className="">View Job</span>

          <OpenInNew className="inline-block h-4 w-4 align-middle" />
        </a>
      </div>
      <div
        className={cn(
          "group relative flex flex-row px-[10px] py-[5px] items-center border gap-1.5 rounded-md h-fit",
          "border-neutral-200 bg-neutral-50",
          "justify-between xl:w-full w-1/2 sm:w-full lg:w-1/2"
        )}
        data-tooltip={"AI Approval Status: " + tooltipText}
      >
        <p className="text-neutral-500 text-xs">AI Approved:</p>
        <div className="flex items-center">
          {approvedByAI === "approve" ? (
            <Done className="inline-block h-4 w-4 align-middle text-success-600" />
          ) : approvedByAI === "reject" ? (
            <Cancel className="inline-block h-4 w-4 align-middle text-error-700" />
          ) : (
            <Pending className="inline-block h-4 w-4 align-middle text-warning-600" />
          )}
        </div>
      </div>
    </div>
  );
};

export default AiApprovedViewJob;
