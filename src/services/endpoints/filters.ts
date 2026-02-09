import { apiService } from "../api";
import * as apiTypes from "@/@types/api";

export const filterApi = {
  toggleActive: (data: apiTypes.ToggleActiveRequest): Promise<void> =>
    apiService.patch("/filters/active", data),

  setInclusionsActive: (data: apiTypes.SetActiveRequest): Promise<void> =>
    apiService.patch("/filters/inclusions", data),

  setExclusionsActive: (data: apiTypes.SetActiveRequest): Promise<void> =>
    apiService.patch("/filters/exclusions", data),

  setUserInclusionActive: (
    data: apiTypes.SetUserFilterActiveRequest
  ): Promise<void> => apiService.patch("/filters/user-inclusions/active", data),

  setUserExclusionActive: (
    data: apiTypes.SetUserFilterActiveRequest
  ): Promise<void> => apiService.patch("/filters/user-exclusions/active", data),
};
