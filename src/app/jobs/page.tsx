"use client";

import {
  Suspense,
  Activity,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Job, JobQueryParams } from "@/@types/api";
import JobsList from "@/components/jobs/jobs-list";
import {
  EMPTY_FILTER_STATE,
  type FilterState,
} from "@/components/jobs/filter-list";
import SearchBar from "@/components/searchBar/search-bar";
import { useInfiniteJobs, useSavedForLaterJobs } from "@/hooks";

const PAGE_LIMIT = 20;

const VALID_FORMULA_DECISIONS = new Set(["approve", "review", "reject"]);
const VALID_SEEN_VALUES = new Set(["seen", "unseen"]);

const getAppliedFiltersFromParams = (
  params: URLSearchParams
): FilterState => {
  const formulaDecision = params.get("formula_decision");
  const seen = params.get("seen");

  return {
    ...EMPTY_FILTER_STATE,
    keyword: params.get("title") || "",
    dateFrom: params.get("date_from") || "",
    dateTo: params.get("date_to") || "",
    approvedByAI: VALID_FORMULA_DECISIONS.has(formulaDecision || "")
      ? formulaDecision || ""
      : "",
    postedBy: params.get("posted_by") || "",
    seen: VALID_SEEN_VALUES.has(seen || "") ? seen || "" : "",
  };
};

function JobsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const refetchJobsRef = useRef<(() => void) | null>(null);
  const searchParamsString = searchParams?.toString() || "";
  const parsedSearchParams = useMemo(
    () => new URLSearchParams(searchParamsString),
    [searchParamsString]
  );
  const urlFilters = useMemo(
    () => getAppliedFiltersFromParams(parsedSearchParams),
    [parsedSearchParams]
  );
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(urlFilters);

  useEffect(() => {
    setAppliedFilters(urlFilters);
  }, [urlFilters]);

  // Keep the same default query behavior while honoring query params from filter apply.
  const queryParams = useMemo<JobQueryParams>(() => {
    const page = parsedSearchParams.get("page");
    const limit = parsedSearchParams.get("limit");
    const approvedByFormula = parsedSearchParams.get("approved_by_formula");
    const approvedByGpt = parsedSearchParams.get("approved_by_gpt");
    const formulaDecision = parsedSearchParams.get("formula_decision");
    const title = parsedSearchParams.get("title");
    const company = parsedSearchParams.get("company");
    const location = parsedSearchParams.get("location");
    const postedBy = parsedSearchParams.get("posted_by");
    const seen = parsedSearchParams.get("seen");
    const parsedPage = page ? parseInt(page, 10) : 1;
    const parsedLimit = limit ? parseInt(limit, 10) : PAGE_LIMIT;

    return {
      post_date: "desc",
      easy_apply: "pending",
      approved_by_formula:
        approvedByFormula === "yes" ||
        approvedByFormula === "no" ||
        approvedByFormula === "pending"
          ? approvedByFormula
          : "yes",
      approved_by_gpt:
        approvedByGpt === "yes" ||
        approvedByGpt === "no" ||
        approvedByGpt === "pending"
          ? approvedByGpt
          : undefined,
      formula_decision:
        formulaDecision === "approve" ||
        formulaDecision === "review" ||
        formulaDecision === "reject"
          ? formulaDecision
          : undefined,
      job_descriptions: true,
      page: Number.isNaN(parsedPage) ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) ? PAGE_LIMIT : parsedLimit,
      title: title || undefined,
      company: company || undefined,
      location: location || undefined,
      posted_by: postedBy || undefined,
      seen: seen || undefined,
    };
  }, [parsedSearchParams]);

  const {
    data,
    isLoading,
    error,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteJobs(queryParams);

  const jobsData = useMemo(() => {
    if (!data?.pages?.length) return undefined;

    const uniqueJobs = new Map<string, Job>();

    data.pages.forEach((page) => {
      page.jobs.forEach((job) => {
        uniqueJobs.set(job.id, job);
      });
    });

    return {
      jobs: Array.from(uniqueJobs.values()),
      total: data.pages[0].total,
      totalPages: data.pages[0].totalPages,
    };
  }, [data]);

  const handleRefetchCallback = useCallback((refetchFn: () => void) => {
    refetchJobsRef.current = refetchFn;
  }, []);

  const handleApplyFilters = useCallback(
    (filters: FilterState) => {
      setAppliedFilters(filters);
      const params = new URLSearchParams(searchParamsString);

      const setOrDelete = (key: string, value: string) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      };

      // Map frontend filter keys to backend query param keys
      setOrDelete("title", filters.keyword.trim());
      setOrDelete("formula_decision", filters.approvedByAI); // approvedByAI maps to formula_decision
      setOrDelete("seen", filters.seen);
      setOrDelete("posted_by", filters.postedBy);
      setOrDelete("date_from", filters.dateFrom);
      setOrDelete("date_to", filters.dateTo);

      // Reset page when filters change
      params.set("page", "1");
      params.set("limit", String(PAGE_LIMIT));

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParamsString]
  );

  return (
    <div className="w-full flex flex-col px-8 py-8 bg-background">
      <SearchBar />
      <JobsList
        data={jobsData}
        isLoading={isLoading}
        error={error as Error | null}
        isError={isError}
        refetch={refetch}
        isFetching={isFetching && !isFetchingNextPage}
        onRefetch={handleRefetchCallback}
        filters={appliedFilters}
        onFiltersStateChange={setAppliedFilters}
        onApplyFilters={handleApplyFilters}
        onLoadMore={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        hasMore={Boolean(hasNextPage)}
        isFetchingMore={isFetchingNextPage}
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
