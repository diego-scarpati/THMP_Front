import { Job } from "@/types/api";
import React, { use } from "react";
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
}

const JobCard = ({
  job,
  index,
  jobDescriptionIndex,
  handleDescriptionChange,
  highlightKeywords,
}: JobCardProps) => {
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
        // switch to grid with left column (fluid) and right column (auto)
        "border-2 rounded-2xl p-3 lg:p-4 hover:shadow-md hover:transition-shadow text-congress-blue-900 transition-colors duration-300",
        "grid grid-cols-[1fr_auto] gap-4 items-start",
        "relative",
        job?.Users?.[0]?.UserJob?.seen ? "border-congress-blue-900" : ""
      )}
      onClick={() => handleDescriptionChange(index)}
    >
      {/* Bookmark icon - positioned absolute top right */}
      <div
        onClick={saveForLaterHandler}
        className={cn("cursor-pointer absolute -top-[2px] right-4 mx-1 overflow-y-visible", index === jobDescriptionIndex ? "bg-congress-blue-300" : "bg-congress-blue-200")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="w-6 h-6 cursor-pointer text-congress-blue-900 hover:text-congress-blue-700 transition-colors z-10 relative -top-[4px]"
          fill={
            job?.Users?.[0]?.UserJob?.saved_for_later ? "currentColor" : index === jobDescriptionIndex ? "#94bee5" : "#c6dbf1"
          }
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {job?.Users?.[0]?.UserJob?.seen && <SeenPill className={cn("absolute -bottom-[2.5px] right-5 text-base/[1rem] z-10 px-1", index === jobDescriptionIndex ? "bg-congress-blue-300" : "bg-congress-blue-200")}/>}

      {/* LEFT: title (top) and meta (bottom) stacked vertically and allowed to shrink */}
      <div className="flex flex-col justify-between min-w-0">
        <div id="job-title" className="mb-2">
          <h3 className="text-lg font-semibold min-w-0 max-w-[550px] lg:text-xl truncate">
            {highlightKeywords ? highlightKeywords(job.title) : job.title}
          </h3>
        </div>

        <div id="job-meta">
          <div className="flex flex-wrap items-center gap-2 text-xs lg:text-sm lg:gap-4">
            <span className="font-semibold">
              {highlightKeywords ? highlightKeywords(job.company) : job.company}
            </span>
            {job.location && (
              <>
                <span className="hidden lg:inline">•</span>
                <span>
                  {highlightKeywords
                    ? highlightKeywords(job.location)
                    : job.location}
                </span>
              </>
            )}
          </div>

          <div className="space-y-2">
            {job.post_date && (
              <div className="text-xs lg:text-sm">
                <span className="font-medium">Posted:</span>{" "}
                {normalizeDates(new Date(job.post_date).toLocaleDateString())}{" "}
                {new Date(job.post_date).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                <span className="hidden lg:inline">{" • "}</span>
                <span className="font-semibold">{job.posted_by}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: AiApprovedViewJob */}
      <div className="flex items-center justify-end mr-4">
        <AiApprovedViewJob
          approvedByAI={job?.Users?.[0]?.UserJob?.approved_by_gpt}
          currentIndex={index === jobDescriptionIndex}
          url={job.url}
        />
      </div>
    </div>
  );
};

export default JobCard;
