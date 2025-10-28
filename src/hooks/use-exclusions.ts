import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { exclusionApi } from '@/services/endpoints'
import type { ApiResponse, CreateExclusionsRequest, Exclusion } from '@/types/api'


// Query hooks for exclusions
export const useExclusions = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.exclusions.list(params),
    queryFn: () => exclusionApi.getAllExclusions(),
  })
}

export const useUserExclusions = () => {
  return useQuery({
    queryKey: queryKeys.exclusions.lists(),
    queryFn: () => exclusionApi.getAllUserExclusions(),
  })
}

// Mutation hooks for exclusions
export const useCreateExclusion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.exclusions.create,
    mutationFn: (data: CreateExclusionsRequest) => exclusionApi.createExclusions(data),
    onSuccess: () => {
      // Invalidate exclusions list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all })
    },
  })
}

export const useDeleteExclusion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.exclusions.delete,
    mutationFn: (id: number) => exclusionApi.deleteExclusion(id),
    onSuccess: () => {
      // Invalidate exclusions list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all })
    },
  })
}