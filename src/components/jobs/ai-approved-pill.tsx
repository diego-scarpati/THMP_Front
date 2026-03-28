import React from "react";
import Done from "@/icons/Done.svg";
import { cn } from "@/lib/utils";

interface AiApprovedPillProps {
  approvedByAI?: "yes" | "no" | "pending";
  currentIndex: boolean;
}

const AiApprovedPill = ({ approvedByAI, currentIndex }: AiApprovedPillProps) => {
  console.log("🚀 ~ AiApprovedPill ~ approvedByAI:", approvedByAI);
  return (
    <div className={cn("inline-flex px-[10px] py-[5px] items-center border gap-1.5 rounded-md w-auto h-fit border-neutral-200 bg-neutral-50")}>
      <p className="font-semibold text-neutral-600 text-xs leading-none">
        AI Approved:
      </p>

      {/* ensure icon/text are aligned vertically */}
      <div className="flex items-center">
        {approvedByAI === "yes" ? (
          <Done className="inline-block h-4 w-4 align-middle" />
        ) : (
          <span className="text-red-500 ml-1 align-middle">No</span>
        )}
      </div>
    </div>
  );
};

export default AiApprovedPill;
