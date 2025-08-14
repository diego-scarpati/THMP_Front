import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { userJobApi } from '@/services/endpoints'
import type { UserJob, CreateUserJobRequest, UpdateUserJobRequest } from '@/types/api'
import type { ApiResponse } from '@/types/api'

// Query hooks for user jobs
export const useUserJobs = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userJobs.byUser(userId),
    queryFn: () => userJobApi.getUserJobs(userId),
    enabled: !!userId,
  })
}

export const useJobUsers = (jobId: string) => {
  return useQuery({
    queryKey: queryKeys.userJobs.byJob(jobId),
    queryFn: () => userJobApi.getJobUsers(jobId),
    enabled: !!jobId,
  })
}

// Mutation hooks for user jobs
export const useCreateUserJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.userJobs.create,
    mutationFn: (data: CreateUserJobRequest) => userJobApi.createUserJob(data),
    onSuccess: (data, variables) => {
      // Invalidate user's jobs
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userJobs.byUser(variables.user_id) 
      })
      // Invalidate job's users
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userJobs.byJob(variables.job_id) 
      })
    },
  })
}

export const useUpdateUserJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.userJobs.update,
    mutationFn: ({ id, data }: { id: number; data: UpdateUserJobRequest }) => 
      userJobApi.updateUserJob(id, data),
    onSuccess: (data) => {
      // Invalidate related queries
      if (data?.data?.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.userJobs.byUser(data.data.user_id) 
        })
      }
      if (data?.data?.job_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.userJobs.byJob(data.data.job_id) 
        })
      }
    },
  })
}

export const useDeleteUserJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.userJobs.delete,
    mutationFn: (id: number) => userJobApi.deleteUserJob(id),
    onSuccess: () => {
      // Invalidate all user jobs queries
      queryClient.invalidateQueries({ queryKey: queryKeys.userJobs.all })
    },
  })
}

export const useUpdateCoverLetter = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.userJobs.updateCoverLetter,
    mutationFn: ({ id, coverLetter }: { id: number; coverLetter: string }) => 
      userJobApi.updateCoverLetter(id, coverLetter),
    onSuccess: (data) => {
      // Invalidate related queries
      if (data?.data?.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.userJobs.byUser(data.data.user_id) 
        })
      }
    },
  })
}

export const useUpdateApprovalStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.userJobs.updateApprovalStatus,
    mutationFn: ({ id, data }: { 
      id: number; 
      data: { approved_by_formula?: string, approved_by_gpt?: string } 
    }) => userJobApi.updateApprovalStatus(id, data),
    onSuccess: (data) => {
      // Invalidate related queries
      if (data?.data?.user_id) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.userJobs.byUser(data.data.user_id) 
        })
      }
    },
  })
}