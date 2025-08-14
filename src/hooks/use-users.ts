import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { userApi } from '@/services/endpoints'
import type { User, CreateUserRequest, UpdateUserRequest, LoginRequest } from '@/types/api'
import type { ApiResponse } from '@/types/api'

// Query hooks for users
export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  })
}

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.users.current(),
    queryFn: () => userApi.getCurrentUser(),
  })
}

// Mutation hooks for users
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.create,
    mutationFn: (userData: CreateUserRequest) => userApi.createUser(userData),
    onSuccess: () => {
      // Invalidate current user query to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
    },
  })
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.update,
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      userApi.updateUser(id, data),
    onSuccess: (data, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(
        queryKeys.users.detail(variables.id),
        (oldData: ApiResponse<User> | undefined) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            data: { ...oldData.data, ...variables.data },
          }
        }
      )
      // If updating current user, invalidate current user query
      queryClient.invalidateQueries({ queryKey: queryKeys.users.current() })
    },
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.delete,
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: (data, id) => {
      // Remove the user from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) })
      // Invalidate current user query
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
      // Set the current user data in cache
      queryClient.setQueryData(queryKeys.users.current(), { data: data.data.user })
      // Invalidate all user-related data to ensure fresh state
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.userJobs.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.userSkills.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.userInclusions.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.userExclusions.all })
    },
  })
}

export const useLogoutUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.users.logout,
    mutationFn: () => Promise.resolve(), // No API endpoint for logout, just clear cache
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
  })
}
