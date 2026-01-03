import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getStoredAccessToken } from '@/services/api'

export const useAccessToken = () => {
  return useQuery({
    queryKey: queryKeys.auth.token(),
    queryFn: () => getStoredAccessToken(),
    staleTime: Infinity,
    initialData: () => getStoredAccessToken(),
  })
}

export const useIsAuthenticated = () => {
  const { data: token } = useAccessToken()
  return !!token
}

export const useAuthTokenValue = () => {
  const queryClient = useQueryClient()
  const token = queryClient.getQueryData<string | null>(queryKeys.auth.token())
  return token ?? null
}
