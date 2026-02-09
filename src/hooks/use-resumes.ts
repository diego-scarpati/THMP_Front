import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, mutationKeys } from '@/lib/query-keys'
import { resumeApi } from '@/services/endpoints'
import type { CreateResumeRequest, UpdateResumeRequest, ExpandedResume, AddResumeSkillsRequest } from '@/@types/api'
import { useAccessToken } from './use-auth'
import { requireStoredAccessToken } from '@/services/api'

// Query hooks for resumes
export const useResume = () => {
  const { data: token } = useAccessToken()
  return useQuery({
    queryKey: queryKeys.resumes.all,
    queryFn: () => resumeApi.getResume(),
    enabled: !!token,
  })
}

// Mutation hooks for resumes
export const useCreateResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.create,
    mutationFn: (resumeData: CreateResumeRequest) => (requireStoredAccessToken(), resumeApi.createResume(resumeData)),
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
      (requireStoredAccessToken(), resumeApi.updateResume(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useDeleteResume = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.delete,
    mutationFn: () => (requireStoredAccessToken(), resumeApi.deleteResume()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useParseResume = () => {
  return useMutation({
    mutationKey: ['resumes', 'parseResume'] as const,
    mutationFn: (formData: FormData): Promise<ExpandedResume> =>
      (requireStoredAccessToken(), resumeApi.parseResume(formData)),
  })
}

export const useAddResumeSkills = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.addSkills,
    mutationFn: (data: AddResumeSkillsRequest) => (requireStoredAccessToken(), resumeApi.addResumeSkills(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}

export const useDeleteResumeSkill = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: mutationKeys.resumes.deleteSkill,
    mutationFn: (skill: string | number) => (requireStoredAccessToken(), resumeApi.deleteResumeSkill(skill)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all })
    },
  })
}
