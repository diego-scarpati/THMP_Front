import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, mutationKeys } from "@/lib/query-keys";
import { skillApi } from "@/services/endpoints";
import type { Skill, CreateSkillRequest } from "@/types/api";

export const useSkills = () => {
  return useQuery({
    queryKey: queryKeys.skills.all,
    queryFn: () => skillApi.getAllSkills(),
  });
};

export const useCreateSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.skills.create,
    mutationFn: (data: CreateSkillRequest) => skillApi.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all });
    },
  });
};

export const useDeleteSkill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.skills.delete,
    mutationFn: (skill: string) => skillApi.deleteSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.all });
    },
  });
};
