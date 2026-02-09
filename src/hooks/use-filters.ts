import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { filterApi } from "@/services/endpoints";
import type { ToggleActiveRequest, SetActiveRequest, SetUserFilterActiveRequest } from "@/@types/api";
import { requireStoredAccessToken } from "@/services/api";

export const useToggleFilterActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.filters.toggleActive,
    mutationFn: (data: ToggleActiveRequest) => filterApi.toggleActive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all });
    },
  });
};

export const useSetInclusionsActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.filters.setInclusionsActive,
    mutationFn: (data: SetActiveRequest) => filterApi.setInclusionsActive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all });
    },
  });
};

export const useSetExclusionsActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.filters.setExclusionsActive,
    mutationFn: (data: SetActiveRequest) => filterApi.setExclusionsActive(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all });
    },
  });
};

export const useSetUserInclusionActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.filters.setUserInclusionActive,
    mutationFn: (data: SetUserFilterActiveRequest) => (requireStoredAccessToken(), filterApi.setUserInclusionActive(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all });
    },
  });
};

export const useSetUserExclusionActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.filters.setUserExclusionActive,
    mutationFn: (data: SetUserFilterActiveRequest) => (requireStoredAccessToken(), filterApi.setUserExclusionActive(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exclusions.all });
    },
  });
};
