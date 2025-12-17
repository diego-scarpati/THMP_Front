import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { inclusionApi } from '@/services/endpoints'
import type { ApiResponse, CreateInclusionsRequest, Inclusion } from '@/types/api'


// Query hooks for inclusions
export const useInclusions = () => {
  return useQuery({
    queryKey: queryKeys.inclusions.all,
    queryFn: () => inclusionApi.getAllInclusions(),
  })
}

// Mutation hooks for inclusions
export const useCreateInclusion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.inclusions.create,
    mutationFn: (data: CreateInclusionsRequest) => inclusionApi.createInclusions(data),
    onSuccess: () => {
      // Invalidate inclusions list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all })
    },
  })
}

export const useDeleteInclusion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.inclusions.delete,
    mutationFn: (inclusion: string) => inclusionApi.deleteInclusion(inclusion),
    onSuccess: () => {
      // Invalidate inclusions list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all })
    },
  })
}