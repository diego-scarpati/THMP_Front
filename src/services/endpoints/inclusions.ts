import { apiService } from "../api";
import * as apiTypes from "@/types/api";

export const inclusionApi = {
  getAllInclusions: (): Promise<apiTypes.Inclusion[]> =>
    apiService.get("/inclusions"),

  createInclusions: (
    data: apiTypes.CreateInclusionsRequest
  ): Promise<{ message: string }> => apiService.post("/inclusions", data),

  deleteInclusion: (inclusion: string): Promise<void> =>
    apiService.delete(
      `/inclusions?inclusion=${encodeURIComponent(inclusion)}`
    ),
};
