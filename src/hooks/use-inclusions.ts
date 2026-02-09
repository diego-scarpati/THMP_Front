import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { inclusionApi } from '@/services/endpoints'
import type { CreateInclusionsRequest } from '@/@types/api'
import { useAccessToken } from './use-auth'
import { requireStoredAccessToken } from '@/services/api'


// Query hooks for inclusions
export const useInclusions = () => {
  const { data: token } = useAccessToken()
  return useQuery({
    queryKey: queryKeys.inclusions.all,
    queryFn: () => inclusionApi.getAllInclusions(),
    enabled: !!token,
  })
}

// Mutation hooks for inclusions
export const useCreateInclusion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.inclusions.create,
    mutationFn: (data: CreateInclusionsRequest) => (requireStoredAccessToken(), inclusionApi.createInclusions(data)),
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
    mutationFn: (inclusion: string) => (requireStoredAccessToken(), inclusionApi.deleteInclusion(inclusion)),
    onSuccess: () => {
      // Invalidate inclusions list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all })
    },
  })
}

// Back-compat alias (older components still import these)
export const useUserInclusions = useInclusions