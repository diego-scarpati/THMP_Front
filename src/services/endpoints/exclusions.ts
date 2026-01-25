import { apiService } from "../api";
import * as apiTypes from "@/types/api";

export const exclusionApi = {
  getAllExclusions: (): Promise<apiTypes.Exclusion[]> =>
    apiService.get("/exclusions"),

  createExclusions: (
    data: apiTypes.CreateExclusionsRequest
  ): Promise<{ message: string }> => apiService.post("/exclusions", data),

  deleteExclusion: (exclusion: string): Promise<void> =>
    apiService.delete(
      `/exclusions?exclusion=${encodeURIComponent(exclusion)}`
    ),
};
