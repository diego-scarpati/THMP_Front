"use client";

import { Suspense, Activity, useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import JobsList from "@/components/jobs/jobs-list";
import SearchBar from "@/components/searchBar/search-bar";
import { useJobs, useSavedForLaterJobs } from "@/hooks";

function JobsPageContent() {
  const searchParams = useSearchParams();
  const refetchJobsRef = useRef<(() => void) | null>(null);

  // Convert URLSearchParams to the format expected by useJobs with null safety
  const queryParams = {
    // post_date: searchParams?.get('post_date') || undefined,
    post_date: "desc",
    // easy_apply: (searchParams?.get('easy_apply') as 'yes' | 'no' | 'pending') || undefined,
    easy_apply: "pending",
    // approved_by_formula: (searchParams?.get('approved_by_formula') as 'yes' | 'no' | 'pending') || undefined,
    approved_by_formula: "yes",
    approved_by_gpt:
      (searchParams?.get("approved_by_gpt") as "yes" | "no" | "pending") ||
      undefined,
    // approved_by_gpt: "yes",
    // job_descriptions: searchParams?.get('job_descriptions') === 'true' ? true : undefined,
    job_descriptions: true,
    page: searchParams?.get("page")
      ? parseInt(searchParams.get("page")!)
      : undefined,
    limit: searchParams?.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined,
  };

  // Remove undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(queryParams).filter(([_, value]) => value !== undefined),
  );

  const { data, isLoading, error, isError, refetch, isFetching } =
    useJobs(cleanParams);

  const handleRefetchCallback = useCallback((refetchFn: () => void) => {
    refetchJobsRef.current = refetchFn;
  }, []);

  return (
    <div className="w-full flex flex-col px-8 py-8 bg-background">
      <SearchBar />
      <JobsList
        data={data}
        isLoading={isLoading}
        error={error}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching}
        onRefetch={handleRefetchCallback}
      />
    </div>
  );
}

function SavedJobsPageContent() {
  const refetchJobsRef = useRef<(() => void) | null>(null);
  const { data: savedJobs, refetch, isLoading, error, isError, isFetching } = useSavedForLaterJobs();

  const handleSearch = useCallback(() => {
    // Trigger refetch of saved jobs
    if (refetchJobsRef.current) {
      refetchJobsRef.current();
    }
  }, []);

  const handleRefetchCallback = useCallback((refetchFn: () => void) => {
    refetchJobsRef.current = refetchFn;
  }, []);

  // Convert the saved jobs data to match the expected format for JobsList
  const jobsData = savedJobs
    ? {
        data: savedJobs,
        pagination: {
          page: 1,
          limit: savedJobs.length,
          total: savedJobs.length,
        },
      }
    : undefined;

  return (
    <div className="w-full flex flex-col px-8 py-8 bg-background">
      {/* <SearchBar /> */}
      <JobsList
        data={
          jobsData?.data
            ? {
                jobs: jobsData.data,
                total: jobsData.pagination.total,
                totalPages: 1,
              }
            : undefined
        }
        isLoading={isLoading}
        error={error}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching}
        onRefetch={handleRefetchCallback}
        className="max-h-[60dvh] h-[60dvh]"
      />
    </div>
  );
}

type ActivityTab = "all" | "saved";

function JobsPageMain() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");

  return (
    <div className="w-full flex flex-col px-8 py-8 bg-background">
      <div className="relative flex justify-center items-center gap-4 w-[80%] mx-auto">
        <div
          className={`absolute w-[9rem] h-[2.5rem] bg-congress-blue-900 rounded-full transition-all duration-300 ${
            activeTab === "all" ? "left-[calc(50%-9.5rem)]" : "left-[calc(50%+0.5rem)]"
          }`}
        />
        <h3
          onClick={() => setActiveTab("all")}
          className={`relative z-10 w-[9rem] h-[2.5rem] flex items-center justify-center text-base/[1rem] font-semibold cursor-pointer transition-colors duration-300 ${
            activeTab === "all" ? "text-background" : ""
          }`}
        >
          Search Jobs
        </h3>
        <h3
          onClick={() => setActiveTab("saved")}
          className={`relative z-10 w-[9rem] h-[2.5rem] flex items-center justify-center text-base/[1rem] font-semibold cursor-pointer transition-colors duration-300 ${
            activeTab === "saved" ? "text-background" : ""
          }`}
        >
          Saved Jobs
        </h3>
      </div>
      <Activity mode={activeTab === "all" ? "visible" : "hidden"}>
        {activeTab === "all" && <JobsPageContent />}
      </Activity>
      <Activity mode={activeTab === "saved" ? "visible" : "hidden"}>
        {activeTab === "saved" && <SavedJobsPageContent />}
      </Activity>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      }
    >
      <JobsPageMain />
    </Suspense>
  );
}
