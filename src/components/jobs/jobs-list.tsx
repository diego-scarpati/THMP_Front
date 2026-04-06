"use client";

import type { Job } from "@/@types/api";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import JobCard from "./job-card";
import FilterList, {
  EMPTY_FILTER_STATE,
  type FilterState,
} from "./filter-list";
import { cn } from "@/lib/utils";
import {
  useBatchMarkJobsSeen,
  useBatchToggleSavedForLater,
} from "@/hooks/use-jobs";
import { registerApiBeforeRequestHandler } from "@/services/api";
import JobsListSkeleton from "@/components/ui/jobs-list-skeleton";

interface JobsListProps {
  data?: {
    jobs: Job[];
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: Error | null;
  isError: boolean;
  refetch: () => void;
  isFetching: boolean;
  onRefetch?: (refetchFn: () => void) => void;
  filters?: FilterState;
  onFiltersStateChange?: (filters: FilterState) => void;
  onApplyFilters?: (filters: FilterState) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  className?: string;
}

export default function JobsList({
  data,
  isLoading,
  error,
  isError,
  refetch,
  isFetching,
  onRefetch,
  filters: controlledFilters,
  onFiltersStateChange,
  onApplyFilters,
  onLoadMore,
  hasMore = false,
  isFetchingMore = false,
  className,
}: JobsListProps) {
  const [jobDescriptionIndex, setJobDescriptionIndex] = useState<number>(0);
  const [localFilters, setLocalFilters] =
    useState<FilterState>(EMPTY_FILTER_STATE);
  const [localSeenByJobId, setLocalSeenByJobId] = useState<
    Record<string, boolean>
  >({});
  const [localSavedForLaterByJobId, setLocalSavedForLaterByJobId] =
    useState<Record<string, boolean>>({});

  const isFiltersControlled = controlledFilters !== undefined;
  const filters = controlledFilters ?? localFilters;

  const descriptionPanelRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement | null>(null);
  const retryCountRef = useRef(0);
  const hasScrolledEnoughRef = useRef<boolean>(false);
  const lastScrollTopRef = useRef<number>(0);
  const isResettingScrollRef = useRef<boolean>(false);

  const pendingSeenJobIdsRef = useRef<Set<string>>(new Set());
  const pendingSavedForLaterJobIdsRef = useRef<Set<string>>(new Set());
  const flushInFlightRef = useRef<Promise<void> | null>(null);

  const batchMarkJobsSeenMutation = useBatchMarkJobsSeen();
  const batchToggleSavedForLaterMutation = useBatchToggleSavedForLater();

  const batchMarkJobsSeenMutationRef = useRef(
    batchMarkJobsSeenMutation.mutateAsync,
  );
  const batchToggleSavedForLaterMutationRef = useRef(
    batchToggleSavedForLaterMutation.mutateAsync,
  );

  batchMarkJobsSeenMutationRef.current = batchMarkJobsSeenMutation.mutateAsync;
  batchToggleSavedForLaterMutationRef.current =
    batchToggleSavedForLaterMutation.mutateAsync;

  const getResolvedSeenValue = useCallback(
    (job: Job): boolean | undefined => {
      const localValue = localSeenByJobId[job.id];
      if (localValue !== undefined) {
        return localValue;
      }

      return job.Users?.[0]?.UserJob?.seen;
    },
    [localSeenByJobId],
  );

  const getResolvedSavedForLaterValue = useCallback(
    (job: Job): boolean | undefined => {
      const localValue = localSavedForLaterByJobId[job.id];
      if (localValue !== undefined) {
        return localValue;
      }

      return job.Users?.[0]?.UserJob?.saved_for_later;
    },
    [localSavedForLaterByJobId],
  );

  const flushPendingUserJobUpdates = useCallback(async () => {
    while (flushInFlightRef.current) {
      await flushInFlightRef.current;
    }

    const hasPendingSeen = pendingSeenJobIdsRef.current.size > 0;
    const hasPendingSavedForLater =
      pendingSavedForLaterJobIdsRef.current.size > 0;

    if (!hasPendingSeen && !hasPendingSavedForLater) {
      return;
    }

    const flushPromise = (async () => {
      const seenJobIds = Array.from(pendingSeenJobIdsRef.current);
      const savedForLaterJobIds = Array.from(
        pendingSavedForLaterJobIdsRef.current,
      );

      pendingSeenJobIdsRef.current.clear();
      pendingSavedForLaterJobIdsRef.current.clear();

      if (seenJobIds.length > 0) {
        console.log("🚀 ~ JobsList ~ seenJobIds:", seenJobIds)
        try {
          await batchMarkJobsSeenMutationRef.current({
            jobIds: seenJobIds,
          });
        } catch (error) {
          for (const jobId of seenJobIds) {
            pendingSeenJobIdsRef.current.add(jobId);
          }
          console.error("Failed to batch mark jobs as seen", error);
        }
      }

      if (savedForLaterJobIds.length > 0) {
        console.log("🚀 ~ JobsList ~ savedForLaterJobIds:", savedForLaterJobIds)
        try {
          await batchToggleSavedForLaterMutationRef.current({
            jobIds: savedForLaterJobIds,
          });
        } catch (error) {
          for (const jobId of savedForLaterJobIds) {
            pendingSavedForLaterJobIdsRef.current.add(jobId);
          }
          console.error("Failed to batch toggle saved-for-later jobs", error);
        }
      }
    })().finally(() => {
      flushInFlightRef.current = null;
    });

    flushInFlightRef.current = flushPromise;
    await flushPromise;
  }, []);

  const queueJobAsSeen = useCallback(
    (job: Job) => {
      const alreadySeen = getResolvedSeenValue(job) ?? false;
      if (alreadySeen) return;

      const jobId = job.id;

      setLocalSeenByJobId((previous) => {
        if (previous[jobId] === true) {
          return previous;
        }

        return {
          ...previous,
          [jobId]: true,
        };
      });

      pendingSeenJobIdsRef.current.add(jobId);
    },
    [getResolvedSeenValue],
  );

  const queueToggleSavedForLater = useCallback(
    (job: Job) => {
      const jobId = job.id;
      const currentSavedForLater = getResolvedSavedForLaterValue(job) ?? false;

      setLocalSavedForLaterByJobId((previous) => ({
        ...previous,
        [jobId]: !currentSavedForLater,
      }));

      const pendingSavedForLaterJobIds =
        pendingSavedForLaterJobIdsRef.current;

      if (pendingSavedForLaterJobIds.has(jobId)) {
        pendingSavedForLaterJobIds.delete(jobId);
      } else {
        pendingSavedForLaterJobIds.add(jobId);
      }
    },
    [getResolvedSavedForLaterValue],
  );

  useEffect(() => {
    const unregisterBeforeRequestHandler = registerApiBeforeRequestHandler(
      async (method) => {
        if (method === "GET" || method === "POST") {
          await flushPendingUserJobUpdates();
        }
      },
    );

    return unregisterBeforeRequestHandler;
  }, [flushPendingUserJobUpdates]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handlePageHide = () => {
      void flushPendingUserJobUpdates();
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [flushPendingUserJobUpdates]);

  // Flush remaining pending changes on unmount/navigation away.
  useEffect(() => {
    return () => {
      void flushPendingUserJobUpdates();
    };
  }, [flushPendingUserJobUpdates]);

  // Auto-retry when data comes back empty (up to 3 times)
  useEffect(() => {
    if (
      !isLoading &&
      !isFetching &&
      !isError &&
      (!data?.jobs || data.jobs.length === 0) &&
      retryCountRef.current < 3
    ) {
      const timer = setTimeout(() => {
        retryCountRef.current += 1;
        refetch();
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (data?.jobs && data.jobs.length > 0) {
      retryCountRef.current = 0;
    }
  }, [isLoading, isFetching, isError, data, refetch]);

  const filteredJobs = useMemo(() => {
    if (!data?.jobs) return [];

    return data.jobs.filter((job: Job) => {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const searchableText = [
          job.title,
          job.company,
          job.JobDescription?.description || "",
          job.location || "",
        ]
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(keyword)) {
          return false;
        }
      }

      if (filters.dateFrom && job.post_date) {
        const jobDate = new Date(job.post_date);
        const fromDate = new Date(filters.dateFrom);
        if (jobDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo && job.post_date) {
        const jobDate = new Date(job.post_date);
        const toDate = new Date(filters.dateTo);
        if (jobDate > toDate) {
          return false;
        }
      }

      if (filters.approvedByAI) {
        const aiApproved =
          job.Users?.[0]?.UserJob?.formula_decision || undefined;
        if (!aiApproved || aiApproved !== filters.approvedByAI) {
          return false;
        }
      }

      if (filters.postedBy) {
        const postedBy = filters.postedBy.toLowerCase();
        const jobPostedBy = (job.posted_by || "").toLowerCase();

        if (!jobPostedBy.includes(postedBy)) {
          return false;
        }
      }

      if (filters.seen) {
        const isSeen = getResolvedSeenValue(job) ?? false;
        if (filters.seen === "seen" && !isSeen) {
          return false;
        }
        if (filters.seen === "unseen" && isSeen) {
          return false;
        }
      }

      return true;
    });
  }, [data?.jobs, filters, getResolvedSeenValue]);

  const jobs = filteredJobs;

  useEffect(() => {
    hasScrolledEnoughRef.current = false;
    isResettingScrollRef.current = true;
  }, [jobDescriptionIndex]);

  const handleDescriptionScroll = useCallback(() => {
    const panel = descriptionPanelRef.current;
    if (!panel || hasScrolledEnoughRef.current) return;

    const currentScrollTop = panel.scrollTop;

    // Wait until the scroll-to-top animation finishes before tracking
    if (isResettingScrollRef.current) {
      if (currentScrollTop <= 1) {
        // Panel has reached the top — start tracking from here
        isResettingScrollRef.current = false;
        lastScrollTopRef.current = 0;
      }
      return;
    }

    const isScrollingDown = currentScrollTop > lastScrollTopRef.current;
    lastScrollTopRef.current = currentScrollTop;

    if (!isScrollingDown) return;

    const scrollPercentage =
      (panel.scrollTop + panel.clientHeight) / panel.scrollHeight;

    if (scrollPercentage >= 0.6) {
      hasScrolledEnoughRef.current = true;
      const currentJob = filteredJobs[jobDescriptionIndex];
      if (currentJob) {
        queueJobAsSeen(currentJob);
      }
    }
  }, [filteredJobs, jobDescriptionIndex, queueJobAsSeen]);

  const handleFiltersChange = (newFilters: FilterState) => {
    if (isFiltersControlled) {
      onFiltersStateChange?.(newFilters);
    } else {
      setLocalFilters(newFilters);
    }

    setJobDescriptionIndex(0);
    onApplyFilters?.(newFilters);
  };

  useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingMore) return;

    const root = listContainerRef.current;
    const trigger = loadMoreTriggerRef.current;

    if (!root || !trigger) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasMore && !isFetchingMore) {
          onLoadMore();
        }
      },
      {
        root,
        rootMargin: "200px 0px",
      },
    );

    observer.observe(trigger);

    return () => {
      observer.disconnect();
    };
  }, [jobs.length, hasMore, isFetchingMore, onLoadMore]);

  const highlightKeywords = (
    text: string,
    keyword: string,
  ): React.ReactNode => {
    if (!keyword || !text) return text;

    const regex = new RegExp(`(${keyword})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span
          key={index}
          className="bg-yellow-300 text-congress-blue-900 font-semibold px-0.5 rounded"
          style={{ backgroundColor: "#fef08a" }}
        >
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  const handleDescriptionChange = (index: number) => {
    if (index === jobDescriptionIndex) return;

    setJobDescriptionIndex(index);

    if (descriptionPanelRef.current) {
      descriptionPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (onRefetch) {
      onRefetch(() => refetch());
    }
  }, [onRefetch, refetch]);

  if (isLoading || (!data?.jobs && !isError)) {
    return <JobsListSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <h3 className="text-red-800 font-semibold">Error loading jobs</h3>
        <p className="text-red-600 mt-1">
          {error?.message || "Failed to fetch jobs. Please try again."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-background hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data?.jobs || data.jobs.length === 0) {
    if (retryCountRef.current < 3) {
      return <JobsListSkeleton />;
    }

    return (
      <div className="text-center p-8 text-congress-blue-900">
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="mt-1">Try adjusting your search criteria.</p>
        <button
          onClick={() => {
            retryCountRef.current = 0;
            refetch();
          }}
          className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-congress-blue-900 bg-background hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>
    );
  }

  const description =
    jobs[jobDescriptionIndex]?.JobDescription?.description || "";

  return (
    <div className="bg-congress-blue-900 rounded-[calc(2rem+1rem)] p-3 sm:p-4">
      <div className="space-y-4 w-full bg-background rounded-4xl px-3 py-3 sm:px-6 sm:py-4">
        <FilterList
          filters={filters}
          onFiltersChange={handleFiltersChange}
          totalJobs={data?.total || 0}
          filteredJobs={filteredJobs.length}
        />
        <div
          className={cn(
            "flex flex-col lg:flex-row lg:space-x-3 lg:max-h-[80dvh] w-full",
            className ? className : "max-h-screen",
          )}
        >
          <div
            ref={listContainerRef}
            className="flex-1 min-w-0 overflow-y-auto pt-[2px] rounded-lg lg:mb-0 scrollbar-hide"
          >
            <div className="grid gap-3 w-full">
              {jobs.map((job: Job, index: number) => {
                const isSeen = getResolvedSeenValue(job) ?? false;
                const isSavedForLater =
                  getResolvedSavedForLaterValue(job) ?? false;

                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    index={index}
                    jobDescriptionIndex={jobDescriptionIndex}
                    handleDescriptionChange={handleDescriptionChange}
                    highlightKeywords={
                      filters.keyword
                        ? (text: string) =>
                            highlightKeywords(text, filters.keyword)
                        : undefined
                    }
                    description={job.JobDescription?.description || ""}
                    isSeen={isSeen}
                    isSavedForLater={isSavedForLater}
                    onToggleSavedForLater={() => queueToggleSavedForLater(job)}
                    onMarkAsSeen={() => queueJobAsSeen(job)}
                  />
                );
              })}
              {onLoadMore && (
                <div ref={loadMoreTriggerRef} className="h-1 w-full" />
              )}
              {isFetchingMore && (
                <p className="text-center text-sm font-semibold text-congress-blue-900 py-3">
                  Loading more jobs...
                </p>
              )}
            </div>
          </div>

          <div
            ref={descriptionPanelRef}
            onScroll={handleDescriptionScroll}
            className="hidden lg:block p-4 border border-congress-blue-300 bg-congress-blue-300 rounded-2xl lg:w-[40%] lg:min-w-[430px] lg:max-w-[640px] lg:max-h-[80dvh] overflow-y-auto scrollbar-hide"
          >
            <div className="mb-4">
              <h3 className="text-lg text-congress-blue-900 text-center font-semibold">
                Job Description
              </h3>
            </div>
            <div className="whitespace-pre-line text-sm leading-relaxed text-congress-blue-900">
              {filters.keyword
                ? highlightKeywords(description, filters.keyword)
                : description}
            </div>
          </div>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center mt-8 text-sm font-semibold text-congress-blue-900">
            <span>
              Showing {filteredJobs.length} of {data.total} jobs
              {filteredJobs.length !== data.total && " (filtered)"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
