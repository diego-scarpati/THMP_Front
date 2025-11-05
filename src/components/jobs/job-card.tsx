import { Job } from "@/types/api";
import React from "react";
import { cn } from "@/lib/utils";
import { normalizeDates } from "@/utils/normalizeDates";
import AiApprovedPill from "./ai-approved-pill";
import AiApprovedViewJob from "./ai-approved-view-job";

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
  return (
    <div
      key={job.id}
      className={cn(
        index === jobDescriptionIndex
          ? "bg-congress-blue-300 border-congress-blue-300"
          : "bg-congress-blue-200 border-congress-blue-200",
        // switch to grid with left column (fluid) and right column (auto)
        "border rounded-lg p-3 lg:p-4 hover:shadow-md hover:transition-shadow text-congress-blue-900 transition-colors duration-300",
        "grid grid-cols-[1fr_auto] gap-4 items-start"
      )}
      onClick={() => handleDescriptionChange(index)}
    >
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
                  {highlightKeywords ? highlightKeywords(job.location) : job.location}
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

      {/* RIGHT: AiApprovedViewJob - vertically centered, spaced from left */}
      <div className="flex items-center justify-end">
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
