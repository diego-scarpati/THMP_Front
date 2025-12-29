import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { resumeApi } from '@/services/endpoints'
import type { CreateResumeRequest, UpdateResumeRequest, ExpandedResume } from '@/types/api'

// Query hooks for resumes
export const useResume = () => {
  return useQuery({
    queryKey: queryKeys.resumes.all,
    queryFn: () => resumeApi.getResume(),
  })
}

// Mutation hooks for resumes
export const useCreateResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.create,
    mutationFn: (resumeData: CreateResumeRequest) => resumeApi.createResume(resumeData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useUpdateResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.update,
    mutationFn: (data: UpdateResumeRequest) => 
      resumeApi.updateResume(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useDeleteResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.delete,
    mutationFn: () => resumeApi.deleteResume(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useParseResume = () => {
  return useMutation({
    mutationKey: ['resumes', 'parseResume'] as const,
    mutationFn: (formData: FormData): Promise<ExpandedResume> =>
      resumeApi.parseResume(formData),
  })
}
