import { apiService } from "../api";
import * as apiTypes from "@/@types/api";
import { buildQueryString } from "./utils";

export const jobApi = {
  getAllJobs: (
    params?: apiTypes.JobQueryParams
  ): Promise<apiTypes.PaginatedJobsResponse> => {
    const queryString = params ? buildQueryString(params) : "";
    return apiService.get(`/jobs/getAll${queryString}`);
  },

  getJobById: (id: string): Promise<apiTypes.Job> =>
    apiService.get(`/jobs/getJobById/${id}`),

  getJobsByCompanyName: (companyName: string): Promise<apiTypes.Job[]> =>
    apiService.get(`/jobs/getJobsByCompanyName/${companyName}`),

  getAllApplied: (): Promise<apiTypes.Job[]> =>
    apiService.get("/jobs/getAllApplied"),

  getAllRejected: (): Promise<apiTypes.Job[]> =>
    apiService.get("/jobs/getAllRejected"),

  getAllSavedForLater: (): Promise<apiTypes.SavedForLaterJobsResponse> =>
    apiService.get("/jobs/savedForLater"),

  markSeen: (
    data: apiTypes.MarkSeenJobsRequest
  ): Promise<apiTypes.MarkSeenJobsResponse> =>
    apiService.post("/jobs/markSeen", data),

  toggleSavedForLater: (
    data: apiTypes.ToggleStateRequest
  ): Promise<apiTypes.ToggleStateResponse> =>
    apiService.patch("/jobs/toggleSavedForLater", data),

  toggleApplied: (
    data: apiTypes.ToggleStateRequest
  ): Promise<apiTypes.ToggleStateResponse> =>
    apiService.patch("/jobs/toggleApplied", data),

  searchAndCreateJobs: (
    params: apiTypes.SearchAndCreateJobsRequest
  ): Promise<string> => {
    const queryString = buildQueryString(params);
    return apiService.post(`/jobs/searchAndCreate${queryString}`);
  },

  searchAndCreateWithAllKeywords: (
    params: apiTypes.SearchAndCreateJobsMultipleKeywordsRequest
  ): Promise<string> => {
    const { keywords, ...queryParams } = params;
    const queryString = buildQueryString(queryParams);
    return apiService.post(
      `/jobs/searchAndCreateWithAllKeywords${queryString}`,
      keywords ? { keywords } : undefined
    );
  },

  approveByGPT: (): Promise<string> =>
    apiService.patch("/jobs/approveByGPT"),

  approveByFormula: (): Promise<string> =>
    apiService.patch("/jobs/approveByFormula"),

  updateApprovedByDate: (): Promise<number> =>
    apiService.patch("/jobs/updateApprovedByDate"),

  updateUserJobsApprovalByFormula:
    (): Promise<apiTypes.UpdateUserJobsApprovalResponse> =>
      apiService.patch("/jobs/updateUserJobsApprovalByFormula"),

  seekSearch: (data: apiTypes.SeekSearchRequest): Promise<string> => {
    const location = data.location || "sydney";
    return apiService.post(
      `/jobs/seek?location=${encodeURIComponent(location)}`,
      { keywords: data.keywords }
    );
  },

  seekAllKeywords: (
    data?: apiTypes.SeekAllKeywordsRequest
  ): Promise<string> => {
    const url = data?.location
      ? `/jobs/seekAllKeywords?location=${encodeURIComponent(data.location)}`
      : "/jobs/seekAllKeywords";
    return apiService.post(
      url,
      data?.keywordArray ? { keywordArray: data.keywordArray } : undefined
    );
  },

  approveByLLM: (): Promise<apiTypes.ApprovalResponse> =>
    apiService.patch("/jobs/approveByLLM"),

  getSeekDescription: (url: string): Promise<string> =>
    apiService.get(`/jobs/getSeekDescription?url=${encodeURIComponent(url)}`),

  indeedSearch: (data: apiTypes.IndeedSearchRequest): Promise<string> => {
    const location = data.location || "sydney";
    return apiService.post(
      `/jobs/indeed?location=${encodeURIComponent(location)}`,
      { keywords: data.keywords }
    );
  },

  indeedAllKeywords: (
    data?: apiTypes.IndeedAllKeywordsRequest
  ): Promise<string> => {
    const url = data?.location
      ? `/jobs/indeedAllKeywords?location=${encodeURIComponent(data.location)}`
      : "/jobs/indeedAllKeywords";
    return apiService.post(
      url,
      data?.keywordArray ? { keywordArray: data.keywordArray } : undefined
    );
  },

  getIndeedDescription: (jobId: string): Promise<string> =>
    apiService.get(
      `/jobs/getIndeedDescription?jobId=${encodeURIComponent(jobId)}`
    ),
};
