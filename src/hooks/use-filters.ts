import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mutationKeys, queryKeys } from "@/lib/query-keys";
import { filterApi } from "@/services/endpoints";
import type { ToggleActiveRequest, SetActiveRequest } from "@/types/api";

export const useToggleFilterActive = (kind: "inclusion" | "exclusion") => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.filters.toggleActive,
    mutationFn: (data: ToggleActiveRequest) =>
      kind === "inclusion"
        ? filterApi.toggleUserInclusionActive(data)
        : filterApi.toggleUserExclusionActive(data),
    onSuccess: () => {
      if (kind === "inclusion") {
        queryClient.invalidateQueries({ queryKey: queryKeys.inclusions.all });
        return;
      }
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
