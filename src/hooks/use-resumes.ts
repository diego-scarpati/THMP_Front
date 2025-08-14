import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { resumeApi } from '@/services/endpoints'
import type { Resume, CreateResumeRequest, UpdateResumeRequest } from '@/types/api'
import type { ApiResponse } from '@/types/api'

// Query hooks for resumes
export const useResumes = () => {
  return useQuery({
    queryKey: queryKeys.resumes.all,
    queryFn: () => resumeApi.getAllResumes(),
  })
}

export const useResume = (id: number) => {
  return useQuery({
    queryKey: queryKeys.resumes.detail(id),
    queryFn: () => resumeApi.getResumeById(id),
    enabled: !!id,
  })
}

export const useResumesByUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.resumes.byUser(userId),
    queryFn: () => resumeApi.getResumesByUser(userId),
    enabled: !!userId,
  })
}

// Mutation hooks for resumes
export const useCreateResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.create,
    mutationFn: (resumeData: CreateResumeRequest) => resumeApi.createResume(resumeData),
    onSuccess: () => {
      // Invalidate all resumes
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useUpdateResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.update,
    mutationFn: ({ id, data }: { id: number; data: UpdateResumeRequest }) => 
      resumeApi.updateResume(id, data),
    onSuccess: (data, variables) => {
      // Update the specific resume in cache
      queryClient.setQueryData(
        queryKeys.resumes.detail(variables.id),
        (oldData: ApiResponse<Resume> | undefined) => {
          if (!oldData) return oldData
          return { ...oldData, data: { ...oldData.data, ...variables.data } }
        }
      )
      // Invalidate all resumes
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useDeleteResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.delete,
    mutationFn: (id: number) => resumeApi.deleteResume(id),
    onSuccess: (data, id) => {
      // Remove the resume from cache
      queryClient.removeQueries({ queryKey: queryKeys.resumes.detail(id) })
      // Invalidate all resumes
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}