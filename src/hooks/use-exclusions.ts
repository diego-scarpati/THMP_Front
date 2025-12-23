import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { exclusionApi } from '@/services/endpoints'
import type { CreateExclusionsRequest } from '@/types/api'


// Query hooks for exclusions
export const useExclusions = () => {
  return useQuery({
    queryKey: queryKeys.exclusions.all,
    queryFn: () => exclusionApi.getAllExclusions(),
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
    mutationFn: (exclusion: string) => exclusionApi.deleteExclusion(exclusion),
    onSuccess: () => {
      // Invalidate exclusions list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all })
    },
  })
}

// Back-compat alias (older components still import these)
export const useUserExclusions = useExclusions