"use client";

import { useJobs } from "@/hooks";
import type { Job } from "@/types/api";
import { useEffect, useRef, useState } from "react";
import JobCard from "./job-card";

interface JobsListProps {
  params?: {
    page?: number;
    limit?: number;
    post_date?: string;
    easy_apply?: "yes" | "no" | "pending";
    approved_by_formula?: "yes" | "no" | "pending";
    approved_by_gpt?: "yes" | "no" | "pending";
    job_descriptions?: boolean;
    company?: string;
    location?: string;
    type?: string;
  };
  onRefetch?: (refetchFn: () => void) => void;
}

export default function JobsList({ params, onRefetch }: JobsListProps) {
  const { data, isLoading, error, isError, refetch, isFetching } =
    useJobs(params);
  const [jobDescriptionIndex, setJobDescriptionIndex] = useState<number>(0);
  const descriptionPanelRef = useRef<HTMLDivElement | null>(null);

  const handleDescriptionChange = (index: number) => {
    if (index === jobDescriptionIndex) return;
    // Should set the index of the clicked job
    setJobDescriptionIndex(index);

    // Scroll to top of the description panel
    console.log(
      "🚀 ~ handleDescriptionChange ~ descriptionPanelRef:",
      descriptionPanelRef
    );
    if (descriptionPanelRef.current) {
      console.log(
        "🚀 ~ handleDescriptionChange ~ descriptionPanelRef.current:",
        descriptionPanelRef.current
      );
      descriptionPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Expose refetch function to parent component
  useEffect(() => {
    if (onRefetch) {
      onRefetch(() => refetch());
    }
  }, [onRefetch, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 ">Loading jobs...</span>
      </div>
    );
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
    return (
      <div className="text-center p-8 text-congress-blue-900">
        <h3 className="text-lg font-medium">No jobs found</h3>
        <p className="mt-1">Try adjusting your search criteria.</p>
        <button
          onClick={() => refetch()}
          className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-congress-blue-900 bg-background hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>
    );
  }

  const jobs = data.jobs;

  const description =
    jobs[jobDescriptionIndex]?.JobDescription?.description || "";

  return (
    <div className="space-y-4 w-full">
      {/* Loading overlay when refetching */}
      {isFetching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-blue-600 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 008-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-sm text-blue-700">Updating results...</span>
          </div>
        </div>
      )}

      {/* Jobs list - full width on mobile, two columns on desktop */}
  <div className="flex flex-col max-h-screen lg:flex-row lg:space-x-3 lg:max-h-[80dvh] w-full">
        {/* LEFT: list - flex-1 so it fills remaining space */}
        <div className="flex-1 overflow-y-auto rounded-lg lg:mb-0 scrollbar-hide">
          <div className="grid gap-3">
            {jobs.map((job: Job, index: number) => (
              <JobCard
                key={job.id}
                job={job}
                index={index}
                jobDescriptionIndex={jobDescriptionIndex}
                handleDescriptionChange={handleDescriptionChange}
              />
            ))}
          </div>
        </div>

        {/* Description panel - full width on mobile, 40% on desktop with min/max constraints */}
        <div
          ref={descriptionPanelRef}
          className="not-last:w-full p-4 border border-congress-blue-300 bg-congress-blue-300 rounded-lg max-h-[40vh] overflow-y-auto scrollbar-hide lg:w-[40%] lg:min-w-[430px] lg:max-w-[640px] lg:max-h-[80dvh]"
        >
          <div className="mb-4">
            <h3 className="text-lg text-congress-blue-900 text-center font-semibold">Job Description</h3>
          </div>
          <div className="whitespace-pre-line text-sm leading-relaxed text-congress-blue-900">
            {description}
          </div>
        </div>
      </div>

      {/* Pagination Info */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 text-sm font-semibold text-congress-blue-900">
          <span>
            Showing {(data.currentPage - 1) * data.limit + 1} to{" "}
            {Math.min(data.currentPage * data.limit, data.total)} of{" "}
            {data.total} results
          </span>
        </div>
      )}
    </div>
  );
}
