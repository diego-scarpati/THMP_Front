import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { getStoredAccessToken } from '@/services/api'
import { userApi } from '@/services/endpoints'

export const useAccessToken = () => {
  return useQuery({
    queryKey: queryKeys.auth.token(),
    queryFn: () => getStoredAccessToken(),
    staleTime: Infinity,
    initialData: () => getStoredAccessToken(),
  })
}

/**
 * Validates the currently stored access token by calling an auth-protected endpoint.
 * - Success => token is valid
 * - 401 (AuthError) => token is invalid/expired
 * - Other errors => treated as unknown (caller decides behavior)
 */
export const useTokenValidity = () => {
  const { data: token } = useAccessToken()

  return useQuery({
    queryKey: queryKeys.auth.validity(token ?? ''),
    queryFn: async () => {
      // If there's no token, don't validate.
      if (!token) return { valid: false as const }

      // This endpoint is expected to require auth; it will throw AuthError on 401.
      await userApi.getUserKeywords()
      return { valid: true as const }
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
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
