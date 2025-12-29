import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { userApi } from '@/services/endpoints'
import type { User, CreateUserRequest, LoginRequest } from '@/types/api'

const CURRENT_USER_STORAGE_KEY = 'thmp.currentUser'

function readStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function writeStoredUser(user: User | null) {
  if (typeof window === 'undefined') return
  try {
    if (!user) {
      window.localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
  } catch {
    // ignore storage failures
  }
}

export const useCurrentUser = () => {
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: async () => {
      const cached = queryClient.getQueryData<User | null>(queryKeys.users.current())
      if (cached !== undefined) return cached
      return readStoredUser()
    },
    staleTime: Infinity,
  })
}

export const useUserKeywords = () => {
  return useQuery({
    queryKey: queryKeys.users.keywords(),
    queryFn: () => userApi.getUserKeywords(),
  })
}

// Mutation hooks for users
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.create,
    mutationFn: (userData: CreateUserRequest) => userApi.createUser(userData),
    onSuccess: () => {
      // No documented /users/me endpoint; current user is set on login.
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
    },
  })
}

export const useLoginUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.login,
    mutationFn: (credentials: LoginRequest) =>
      userApi.loginUser(credentials),
    onSuccess: (data) => {
      const user = data.data.user
      writeStoredUser(user)
      queryClient.setQueryData<User | null>(queryKeys.users.current(), user)
      // Invalidate user-scoped lists that depend on the configured user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all })
    },
  })
}

export const useLogoutUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.logout,
    mutationFn: () => Promise.resolve(), // No API endpoint for logout, just clear cache
    onSuccess: () => {
      writeStoredUser(null)
      // Clear all cached data on logout
      queryClient.clear()
    },
  })
}

