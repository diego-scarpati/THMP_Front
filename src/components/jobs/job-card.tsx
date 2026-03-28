import { Job } from "@/@types/api";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { normalizeDates } from "@/utils/normalizeDates";
// import AiApprovedPill from "./ai-approved-pill";
import AiApprovedViewJob from "./ai-approved-view-job";
import SeenPill from "../ui/seen-pill";

interface JobCardProps {
  job: Job;
  index: number;
  jobDescriptionIndex: number;
  handleDescriptionChange: (index: number) => void;
  highlightKeywords?: (text: string) => React.ReactNode;
  description?: string;
  isSeen: boolean;
  isSavedForLater: boolean;
  onToggleSavedForLater: () => void;
  onMarkAsSeen?: () => void;
}

const JobCard = ({
  job,
  index,
  jobDescriptionIndex,
  handleDescriptionChange,
  highlightKeywords,
  description,
  isSeen,
  isSavedForLater,
  onToggleSavedForLater,
  onMarkAsSeen,
}: JobCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isFocused = index === jobDescriptionIndex;

  // Auto-collapse when this card loses focus
  useEffect(() => {
    if (!isFocused) {
      setIsExpanded(false);
    }
  }, [isFocused]);

  const mobileDescriptionRef = useRef<HTMLDivElement | null>(null);
  const mobileHasScrolledEnoughRef = useRef(false);
  const mobileLastScrollTopRef = useRef(0);

  // Reset scroll tracking when the card is collapsed/re-expanded
  useEffect(() => {
    if (isExpanded) {
      mobileHasScrolledEnoughRef.current = false;
      mobileLastScrollTopRef.current = 0;
    }
  }, [isExpanded]);

  // When expanded, check if the mobile description is not scrollable (short content) — if so, no auto-seen
  // Seen only triggers on downward scroll past 60%
  const handleMobileDescriptionScroll = useCallback(() => {
    const panel = mobileDescriptionRef.current;
    if (!panel || mobileHasScrolledEnoughRef.current || isSeen) return;

    const currentScrollTop = panel.scrollTop;
    const isScrollingDown = currentScrollTop > mobileLastScrollTopRef.current;
    mobileLastScrollTopRef.current = currentScrollTop;

    if (!isScrollingDown) return;

    const scrollPercentage =
      (panel.scrollTop + panel.clientHeight) / panel.scrollHeight;

    if (scrollPercentage >= 0.6) {
      mobileHasScrolledEnoughRef.current = true;
      onMarkAsSeen?.();
    }
  }, [isSeen, onMarkAsSeen]);

  const saveForLaterHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSavedForLater();
  };

  return (
    <div
      key={job.id}
      className={cn(
        "bg-white border border-neutral-200 rounded-xl p-3 sm:p-4 cursor-pointer transition-colors duration-150 hover:border-neutral-300 hover:shadow-sm relative min-w-0 w-full",
        isSeen
          ? "border-l-4 border-l-neutral-300"
          : "border-l-4 border-l-primary-500",
        index === jobDescriptionIndex
          ? "ring-2 ring-primary-500 ring-offset-0 border-primary-200"
          : "",
        "xl:grid xl:grid-cols-[1fr_auto] gap-3 xl:gap-4 items-start",
        "sm:grid sm:grid-cols-[1fr_auto] lg:flex lg:flex-col",
      )}
      onClick={() => {
        // On mobile, toggle the inline description
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          setIsExpanded((prev) => !prev);
        }
        handleDescriptionChange(index);
      }}
    >
      {/* Bookmark icon - positioned absolute top right */}
      <div
        onClick={saveForLaterHandler}
        data-tooltip={
          isSavedForLater
            ? "Remove from saved jobs"
            : "Save for later"
        }
        data-tooltip-position="left"
        className="cursor-pointer absolute top-2 right-2 p-2 -m-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={cn(
            "w-6 h-6 cursor-pointer transition-colors z-10 relative",
            isSavedForLater
              ? "text-primary-600 hover:text-primary-700"
              : "text-neutral-300 hover:text-primary-500",
          )}
          fill={isSavedForLater ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </div>

      {/* Seen icon */}
      {isSeen && (
        <SeenPill />
      )}

      {/* LEFT: title (top) and meta (bottom) stacked vertically and allowed to shrink */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col justify-between">
        <div id="job-title" className="mb-2">
          <h3 className="text-neutral-900 font-semibold text-sm sm:text-base lg:max-w-full xl:max-w-[500px] md:w-[clamp(200px,100%,550px)] sm:w-[clamp(150px,100%,400px)] truncate mt-1 sm:mt-0">
            {highlightKeywords ? highlightKeywords(job.title) : job.title}
          </h3>
        </div>

        <div id="job-meta">
          <div className="flex items-center gap-2 text-neutral-500 text-xs sm:text-sm">
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
              <div className="text-neutral-400 text-xs">
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
          approvedByAI={job.Users?.[0]?.UserJob?.formula_decision ?? undefined}
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
        <div className="h-8 w-8 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "w-5 h-5 text-neutral-400 transition-transform duration-300",
              isExpanded ? "rotate-180" : "rotate-0"
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Inline description - visible only below lg when expanded */}
      {isExpanded && description && (
        <div className="lg:hidden col-span-full border-t border-neutral-200 mt-3 pt-3 w-full">
          <h4 className="text-sm font-semibold mb-2">Job Description</h4>
          <div
            ref={mobileDescriptionRef}
            onScroll={handleMobileDescriptionScroll}
            className="whitespace-pre-line text-neutral-700 text-xs leading-relaxed max-h-[40vh] overflow-y-auto scrollbar-hide"
          >
            {highlightKeywords ? highlightKeywords(description) : description}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
