import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { keywordApi } from '@/services/endpoints'
import type { Keyword, CreateKeywordRequest, UpdateKeywordRequest } from '@/types/api'
import type { ApiResponse } from '@/types/api'

// Query hooks for keywords
export const useKeywords = () => {
  return useQuery({
    queryKey: queryKeys.keywords.lists(),
    queryFn: () => keywordApi.getAllKeywords(),
  })
}

export const useUserKeywords = () => {
  return useQuery({
    queryKey: queryKeys.keywords.lists(),
    queryFn: () => keywordApi.getAllUserKeywords(),
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

export const useUpdateKeyword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.keywords.update,
    mutationFn: ({ id, data }: { id: number; data: UpdateKeywordRequest }) => 
      keywordApi.updateKeyword(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        queryKeys.keywords.detail(variables.id),
        (oldData: ApiResponse<Keyword> | undefined) => {
          if (!oldData) return oldData
          return { ...oldData, data: { ...oldData.data, ...variables.data } }
        }
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords.lists() })
    },
  })
}

export const useDeleteKeyword = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.keywords.delete,
    mutationFn: (id: number) => keywordApi.deleteKeyword(id),
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.keywords.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.keywords.lists() })
    },
  })
}