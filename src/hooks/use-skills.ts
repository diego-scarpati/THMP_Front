import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import { skillApi } from "@/services/endpoints";
import type { Skill, CreateSkillRequest } from "@/types/api";
import { useAccessToken } from "./use-auth";
import { requireStoredAccessToken } from "@/services/api";

export const useSkills = () => {
  const { data: token } = useAccessToken();
  return useQuery({
    queryKey: queryKeys.skills.all,
    queryFn: () => skillApi.getAllSkills(),
    enabled: !!token,
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.skills.create,
    mutationFn: (data: CreateSkillRequest) => (requireStoredAccessToken(), skillApi.createSkill(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.skills.delete,
    mutationFn: (skill: string) => (requireStoredAccessToken(), skillApi.deleteSkill(skill)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all });
    },
  });
};
