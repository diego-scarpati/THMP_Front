import { Job } from "@/@types/api";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { normalizeDates } from "@/utils/normalizeDates";
// import AiApprovedPill from "./ai-approved-pill";
import AiApprovedViewJob from "./ai-approved-view-job";
import { useToggleSavedForLater } from "@/hooks";
import SeenPill from "../ui/seen-pill";

interface JobCardProps {
  job: Job;
  index: number;
  jobDescriptionIndex: number;
  handleDescriptionChange: (index: number) => void;
  highlightKeywords?: (text: string) => React.ReactNode;
  description?: string;
}

const JobCard = ({
  job,
  index,
  jobDescriptionIndex,
  handleDescriptionChange,
  highlightKeywords,
  description,
}: JobCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleSaveForLater = useToggleSavedForLater();

  const saveForLaterHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!job.id || job?.Users?.[0]?.UserJob?.saved_for_later === undefined)
      return;
    toggleSaveForLater.mutate({
      jobId: job.id,
      currentState: job.Users[0].UserJob.saved_for_later,
    });
  };

  return (
    <div
      key={job.id}
      className={cn(
        index === jobDescriptionIndex
          ? "bg-congress-blue-300 border-congress-blue-300"
          : "bg-congress-blue-200 border-congress-blue-200",
        "border-2 rounded-2xl p-3 hover:shadow-md hover:transition-shadow text-congress-blue-900 transition-colors duration-300",
        "xl:grid xl:grid-cols-[1fr_auto] gap-3 xl:gap-4 items-start",
        "sm:grid sm:grid-cols-[1fr_auto] lg:flex lg:flex-col",
        "relative min-w-0 w-auto",
        // "max-w-[80%]",
        job?.Users?.[0]?.UserJob?.seen ? "border-congress-blue-900" : "",
      )}
      onClick={() => handleDescriptionChange(index)}
    >
      {/* Bookmark icon - positioned absolute top right */}
      <div
        onClick={saveForLaterHandler}
        data-tooltip={
          job?.Users?.[0]?.UserJob?.saved_for_later
            ? "Remove from saved jobs"
            : "Save for later"
        }
        data-tooltip-position="left"
        className={cn(
          "cursor-pointer absolute -top-[2px] right-4 mx-1 overflow-y-visible",
          index === jobDescriptionIndex
            ? "bg-congress-blue-300"
            : "bg-congress-blue-200",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 cursor-pointer text-congress-blue-900 hover:text-congress-blue-700 transition-colors z-10 relative -top-[4px]"
          fill={
            job?.Users?.[0]?.UserJob?.saved_for_later
              ? "currentColor"
              : index === jobDescriptionIndex
                ? "#94bee5"
                : "#c6dbf1"
          }
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {/* Seen icon */}
      {job?.Users?.[0]?.UserJob?.seen && (
        <SeenPill
          className={cn(
            "absolute -bottom-[2.5px] right-5 text-base/[1rem] z-10 px-1",
            index === jobDescriptionIndex
              ? "bg-congress-blue-300"
              : "bg-congress-blue-200",
          )}
        />
      )}

      {/* LEFT: title (top) and meta (bottom) stacked vertically and allowed to shrink */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-between">
        <div id="job-title" className="mb-2">
          <h3 className="text-lg font-semibold lg:text-xl lg:max-w-full xl:max-w-[500px] md:w-[clamp(200px,100%,550px)] sm:w-[clamp(150px,100%,400px)] truncate mt-1 sm:mt-0">
            {highlightKeywords ? highlightKeywords(job.title) : job.title}
          </h3>
        </div>

        <div id="job-meta">
          <div className="flex items-center gap-2 text-xs lg:text-sm ">
            <span className="font-semibold lg:max-w-[180px] xl:max-w-[300px] md:max-w-[clamp(100px,100%,300px)] sm:max-w-[clamp(80px,100%,250px)] truncate">
              {highlightKeywords ? highlightKeywords(job.company) : job.company}
            </span>
            {job.location && (
              <>
                <span className="lg:hidden inline">•</span>
                <span className="truncate lg:max-w-[200px] xl:max-w-[220px] md:w-[clamp(100px,100%,300px)] sm:w-[clamp(80px,70%,220px)]">
                  {highlightKeywords
                    ? highlightKeywords(job.location)
                    : job.location}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-row w-auto lg:max-w-[220px] xl:max-w-[300px]">
            {job.post_date && (
              <div className="text-xs lg:text-sm">
                <span className="lg:hidden xl:inline font-medium">Posted:</span>{" "}
                {normalizeDates(new Date(job.post_date).toLocaleDateString())}{" "}
                {new Date(job.post_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span className="lg:hidden xl:inline">{" • "}</span>
                <span className="font-semibold max-w-[80px]">{job.posted_by}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: AiApprovedViewJob */}
      <div className={cn("flex w-full xl:w-auto items-center xl:justify-end xl:mr-4 justify-center")}>
        <AiApprovedViewJob
          approvedByAI={job?.Users?.[0]?.UserJob?.formula_decision}
          currentIndex={index === jobDescriptionIndex}
          url={job.url}
        />
      </div>

      {/* Mobile chevron toggle - visible only below lg */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded((prev) => !prev);
        }}
        className={cn("lg:hidden col-span-full flex items-center justify-center w-full pt-1", isExpanded && "pb-2")}
        aria-label={isExpanded ? "Collapse description" : "Expand description"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "w-5 h-5 transition-transform duration-300",
            isExpanded ? "rotate-180" : "rotate-0"
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Inline description - visible only below lg when expanded */}
      {isExpanded && description && (
        <div className="lg:hidden col-span-full pt-3 border-t border-congress-blue-900/50 w-full">
          <h4 className="text-sm font-semibold mb-2">Job Description</h4>
          <div className="whitespace-pre-line text-xs leading-relaxed max-h-[40vh] overflow-y-auto scrollbar-hide">
            {highlightKeywords ? highlightKeywords(description) : description}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
