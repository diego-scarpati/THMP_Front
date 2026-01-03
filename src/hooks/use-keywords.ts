import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { keywordApi } from '@/services/endpoints'
import type { CreateKeywordRequest } from '@/types/api'
import { useAccessToken } from './use-auth'

// Query hooks for keywords
export const useKeywords = () => {
  return useQuery({
    queryKey: queryKeys.keywords.list(),
    queryFn: () => keywordApi.getAllKeywords(),
  })
}

export const useUserKeywords = () => {
  const { data: token } = useAccessToken()
  return useQuery({
    queryKey: queryKeys.keywords.lists(),
    queryFn: () => keywordApi.getAllUserKeywords(),
    enabled: !!token,
  })
}

export const useKeyword = (id: number) => {
  return useQuery({
    queryKey: queryKeys.keywords.detail(id),
    queryFn: () => keywordApi.getKeywordById(id),
    enabled: !!id,
  })
}

// Mutation hooks for keywords
export const useCreateKeyword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.keywords.create,
    mutationFn: (data: CreateKeywordRequest) => keywordApi.createKeyword(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords.lists() })
    },
  })
}