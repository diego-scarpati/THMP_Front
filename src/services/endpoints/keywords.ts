import { apiService } from "../api";
import * as apiTypes from "@/types/api";

export const keywordApi = {
  getAllKeywords: (): Promise<apiTypes.Keyword[]> =>
    apiService.get("/keywords/getAll"),

  getAllUserKeywords: (): Promise<apiTypes.Keyword[]> =>
    apiService.get("/keywords/getAllUserKeywords"),

  getKeywordById: (id: number): Promise<apiTypes.Keyword> =>
    apiService.get(`/keywords/getById/${id}`),

  createKeyword: (
    data: apiTypes.CreateKeywordRequest
  ): Promise<apiTypes.Keyword> => apiService.post("/keywords/create", data),
};
