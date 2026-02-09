import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import { jobApi } from "@/services/endpoints";
import { requireStoredAccessToken } from "@/services/api";
import { useAccessToken } from "./use-auth";
import type {
  MarkSeenJobsRequest,
  SearchAndCreateJobsRequest,
  JobQueryParams,
  SearchAndCreateJobsMultipleKeywordsRequest,
  ToggleStateRequest,
} from "@/@types/api";

// Query hooks for jobs
export const useJobs = (params?: JobQueryParams) => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobApi.getAllJobs(params),
    enabled: !!token,
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => jobApi.getJobById(id),
    enabled: !!id,
  });
};

export const useSeekDescription = (url: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.seekDescription(url),
    queryFn: () => jobApi.getSeekDescription(url),
    enabled: !!url,
  });
};

export const useJobsByCompany = (companyName: string) => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.jobs.byCompany(companyName),
    queryFn: () => jobApi.getJobsByCompanyName(companyName),
    enabled: !!companyName && !!token,
  });
};

export const useJobsByAcceptance = (
  formulaAcceptance?: string,
  gptAcceptance?: string
) => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.jobs.byAcceptance(formulaAcceptance, gptAcceptance),
    queryFn: () =>
      jobApi.getAllJobs({
        approved_by_formula: formulaAcceptance as "yes" | "no" | "pending",
        approved_by_gpt: gptAcceptance as "yes" | "no" | "pending",
      }),
    enabled: (!!formulaAcceptance || !!gptAcceptance) && !!token,
  });
};

export const useAppliedJobs = () => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.jobs.applied(),
    queryFn: () => jobApi.getAllApplied(),
    enabled: !!token,
  });
};

export const useRejectedJobs = () => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.jobs.rejected(),
    queryFn: () => jobApi.getAllRejected(),
    enabled: !!token,
  });
};

export const useSavedForLaterJobs = () => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.jobs.savedForLater(),
    queryFn: () => jobApi.getAllSavedForLater(),
    enabled: !!token,
  });
};

// Note: There's no getAllApproved endpoint in the API, removing this hook
// export const useApprovedJobs = () => {
//   return useQuery({
//     queryKey: queryKeys.jobs.approved(),
//     queryFn: () => jobApi.getAllApproved(),
//   })
// }

// Mutation hooks for jobs

export const useSearchAndCreateJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.searchAndCreate,
    mutationFn: (searchParams: SearchAndCreateJobsRequest) =>
      (requireStoredAccessToken(), jobApi.searchAndCreateJobs(searchParams)),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useSearchAndCreateWithAllKeywords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.searchAndCreateWithAllKeywords,
    mutationFn: (searchParams: SearchAndCreateJobsMultipleKeywordsRequest) =>
      (requireStoredAccessToken(), jobApi.searchAndCreateWithAllKeywords(searchParams)),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useApproveJobByFormula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.approveByFormula,
    mutationFn: () => (requireStoredAccessToken(), jobApi.approveByFormula()),
    onSuccess: () => {
      // Invalidate all job-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

export const useApproveJobByGPT = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.approveByGPT,
    mutationFn: () => (requireStoredAccessToken(), jobApi.approveByGPT()),
    onSuccess: () => {
      // Invalidate all job-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

export const useUpdateApprovedByDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.updateApprovedByDate,
    mutationFn: () => (requireStoredAccessToken(), jobApi.updateApprovedByDate()),
    onSuccess: () => {
      // Invalidate all job-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

// export const useSaveJobsToFile = () => {
//   return useMutation({
//     mutationKey: mutationKeys.jobs.saveToFile,
//     mutationFn: () => jobApi.saveJobsToFile(),
//   })
// }

export const useToggleSavedForLater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.toggleSavedForLater,
    mutationFn: (data: ToggleStateRequest) =>
      (requireStoredAccessToken(), jobApi.toggleSavedForLater(data)),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useToggleApplied = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.toggleApplied,
    mutationFn: (data: ToggleStateRequest) =>
      (requireStoredAccessToken(), jobApi.toggleApplied(data)),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

// ===== NEW HOOKS FROM API REFERENCE =====

export const useUpdateUserJobsApprovalByFormula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.updateUserJobsApprovalByFormula,
    mutationFn: () => (requireStoredAccessToken(), jobApi.updateUserJobsApprovalByFormula()),
    onSuccess: () => {
      // Invalidate all job-related and userJob queries
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.userJobs.all });
    },
  });
};

export const useSeekSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.seekSearch,
    mutationFn: (data: { keywords: string[]; location?: string }) =>
      (requireStoredAccessToken(), jobApi.seekSearch(data)),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useSeekAllKeywords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.seekAllKeywords,
    mutationFn: (data?: { keywordArray?: string[]; location?: string }) =>
      (requireStoredAccessToken(), jobApi.seekAllKeywords(data)),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useApproveJobByLLM = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.approveByLLM,
    mutationFn: () => (requireStoredAccessToken(), jobApi.approveByLLM()),
    onSuccess: () => {
      // Invalidate all job-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};

export const useMarkJobsSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.markSeen,
    mutationFn: (data: MarkSeenJobsRequest) => (requireStoredAccessToken(), jobApi.markSeen(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

// ===== INDEED HOOKS =====

export const useIndeedDescription = (jobId: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.indeedDescription(jobId),
    queryFn: () => jobApi.getIndeedDescription(jobId),
    enabled: !!jobId,
  });
};

export const useIndeedSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.indeedSearch,
    mutationFn: (data: { keywords: string[]; location?: string }) =>
      (requireStoredAccessToken(), jobApi.indeedSearch(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useIndeedAllKeywords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.indeedAllKeywords,
    mutationFn: (data?: { keywordArray?: string[]; location?: string }) =>
      (requireStoredAccessToken(), jobApi.indeedAllKeywords(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

