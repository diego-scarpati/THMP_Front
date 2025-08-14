import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { jobDescriptionApi } from '@/services/endpoints'
import type { JobDescription, CreateJobDescriptionRequest, UpdateJobDescriptionRequest } from '@/types/api'
import type { PaginationParams, ApiResponse } from '@/types/api'

// Query hooks for job descriptions
export const useJobDescriptions = () => {
  return useQuery({
    queryKey: queryKeys.jobDescriptions.lists(),
    queryFn: () => jobDescriptionApi.getAllJobDescriptions(),
  })
}

export const useJobDescription = (id: string) => {
  return useQuery({
    queryKey: queryKeys.jobDescriptions.detail(id),
    queryFn: () => jobDescriptionApi.getJobDescriptionById(id),
    enabled: !!id,
  })
}

// Mutation hooks for job descriptions
export const useCreateJobDescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.jobDescriptions.create,
    mutationFn: (data: CreateJobDescriptionRequest) => 
      jobDescriptionApi.createJobDescription(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobDescriptions.lists() })
    },
  })
}

export const useUpdateJobDescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.jobDescriptions.update,
    mutationFn: ({ id, data }: { id: string; data: UpdateJobDescriptionRequest }) => 
      jobDescriptionApi.updateJobDescription(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.jobDescriptions.detail(variables.id),
        (oldData: ApiResponse<JobDescription> | undefined) => {
          if (!oldData) return oldData
          return { ...oldData, data: { ...oldData.data, ...variables.data } }
        }
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.jobDescriptions.lists() })
    },
  })
}

export const useDeleteJobDescription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.jobDescriptions.delete,
    mutationFn: (id: string) => jobDescriptionApi.deleteJobDescription(id),
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.jobDescriptions.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobDescriptions.lists() })
    },
  })
}

export const useLoopAndCreateJobDescriptions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.jobDescriptions.loopAndCreate,
    mutationFn: () => jobDescriptionApi.loopAndCreateJobDescription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobDescriptions.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() })
    },
  })
}