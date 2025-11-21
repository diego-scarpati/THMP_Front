import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import { jobApi } from "@/services/endpoints";
import type {
  Job,
  CreateJobRequest,
  UpdateJobRequest,
  BulkCreateJobsRequest,
  SearchAndCreateJobsRequest,
  JobQueryParams,
  JobAcceptanceFilterParams,
  SearchAndCreateJobsMultipleKeywordsRequest,
  SeekSearchRequest,
  SeekAllKeywordsRequest,
} from "@/types/api";
import type { PaginatedResponse, ApiResponse } from "@/types/api";

// Query hooks for jobs
export const useJobs = (params?: JobQueryParams) => {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn: () => jobApi.getAllJobs(params),
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn: () => jobApi.getJobById(id),
    enabled: !!id,
  });
};

export const useJobsByCompany = (companyName: string) => {
  return useQuery({
    queryKey: queryKeys.jobs.byCompany(companyName),
    queryFn: () => jobApi.getJobsByCompanyName(companyName),
    enabled: !!companyName,
  });
};

export const useJobsByAcceptance = (
  formulaAcceptance?: string,
  gptAcceptance?: string
) => {
  return useQuery({
    queryKey: queryKeys.jobs.byAcceptance(formulaAcceptance, gptAcceptance),
    queryFn: () =>
      jobApi.getAllByAcceptance({
        formulaAcceptance: formulaAcceptance as "yes" | "no" | "pending",
        gptAcceptance: gptAcceptance as "yes" | "no" | "pending",
      }),
    enabled: !!formulaAcceptance || !!gptAcceptance,
  });
};

export const useAppliedJobs = () => {
  return useQuery({
    queryKey: queryKeys.jobs.applied(),
    queryFn: () => jobApi.getAllApplied(),
  });
};

export const useRejectedJobs = () => {
  return useQuery({
    queryKey: queryKeys.jobs.rejected(),
    queryFn: () => jobApi.getAllRejected(),
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
export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.create,
    mutationFn: (jobData: CreateJobRequest) => jobApi.createJob(jobData),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.update,
    mutationFn: ({ id, data }: { id: string; data: UpdateJobRequest }) =>
      jobApi.updateJob(id, data),
    onSuccess: (data, variables) => {
      // Update the specific job in cache
      queryClient.setQueryData(
        queryKeys.jobs.detail(variables.id),
        (oldData: ApiResponse<Job> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: { ...oldData.data, ...variables.data },
          };
        }
      );
      // Invalidate job lists to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.delete,
    mutationFn: (id: string) => jobApi.deleteJob(id),
    onSuccess: (data, id) => {
      // Remove the job from cache
      queryClient.removeQueries({ queryKey: queryKeys.jobs.detail(id) });
      // Invalidate job lists to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useBulkCreateJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.bulkCreate,
    mutationFn: (jobsData: BulkCreateJobsRequest) =>
      jobApi.bulkCreateJobs(jobsData),
    onSuccess: () => {
      // Invalidate all job lists to refresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
  });
};

export const useSearchAndCreateJobs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.searchAndCreate,
    mutationFn: (searchParams: SearchAndCreateJobsRequest) =>
      jobApi.searchAndCreateJobs(searchParams),
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
      jobApi.searchAndCreateWithAllKeywords(searchParams),
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
    mutationFn: () => jobApi.approveByFormula(),
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
    mutationFn: () => jobApi.approveByGPT(),
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
    mutationFn: () => jobApi.updateApprovedByDate(),
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

// ===== NEW HOOKS FROM API REFERENCE =====

export const useUpdateUserJobsApprovalByFormula = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.jobs.updateUserJobsApprovalByFormula,
    mutationFn: () => jobApi.updateUserJobsApprovalByFormula(),
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
      jobApi.seekSearch(data),
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
      jobApi.seekAllKeywords(data),
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
    mutationFn: () => jobApi.approveByLLM(),
    onSuccess: () => {
      // Invalidate all job-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
  });
};
