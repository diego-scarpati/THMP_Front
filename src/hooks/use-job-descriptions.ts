import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { jobDescriptionApi } from '@/services/endpoints'
import type { CreateJobDescriptionRequest } from '@/types/api'
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