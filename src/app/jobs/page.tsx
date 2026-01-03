"use client";

import { Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import JobsList from "@/components/jobs/jobs-list";
import SearchBar from "@/components/searchBar/search-bar";

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
    Object.entries(queryParams).filter(([_, value]) => value !== undefined)
  );

  const handleSearch = useCallback(() => {
    // Trigger refetch of jobs with current parameters
    if (refetchJobsRef.current) {
      refetchJobsRef.current();
    }
  }, []);

  const handleRefetchCallback = useCallback((refetchFn: () => void) => {
    refetchJobsRef.current = refetchFn;
  }, []);

  return (
    <div className="w-full flex flex-col px-8 py-8 bg-background">
      <SearchBar />
      <JobsList params={cleanParams} onRefetch={handleRefetchCallback} />
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
      <JobsPageContent />
    </Suspense>
  );
}
