import { apiService } from "./api";
import * as apiTypes from "@/types/api";

// Helper to build query string
const buildQueryString = (params: Record<string, unknown> | unknown): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

// Job API functions
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

  markSeen: (data: apiTypes.MarkSeenJobsRequest): Promise<apiTypes.MarkSeenJobsResponse> =>
    apiService.post("/jobs/markSeen", data),

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

  seekAllKeywords: (data?: apiTypes.SeekAllKeywordsRequest): Promise<string> => {
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
};

// Job Description API functions
export const jobDescriptionApi = {
  getAllJobDescriptions: (): Promise<apiTypes.JobDescription[]> =>
    apiService.get("/jobDescriptions/getAll"),

  getJobDescriptionById: (id: string): Promise<apiTypes.JobDescription> =>
    apiService.get(`/jobDescriptions/getById/${id}`),

  createJobDescription: (
    data: apiTypes.CreateJobDescriptionRequest
  ): Promise<apiTypes.JobDescription> =>
    apiService.post("/jobDescriptions/create", data),
};

// User API functions
export const userApi = {
  createUser: (userData: apiTypes.CreateUserRequest): Promise<apiTypes.User> =>
    apiService.post("/users/createUser", userData),

  loginUser: (
    credentials: apiTypes.LoginRequest
  ): Promise<apiTypes.LoginResponse> =>
    apiService.post("/users/loginUser", credentials),

  getUser: (id: string): Promise<apiTypes.User> =>
    apiService.get(`/users/user/${id}`),

  getUserKeywords: (): Promise<string[]> => apiService.get("/users/keywords"),
};

// Keyword API functions
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

// Skill API functions
export const skillApi = {
  getAllSkills: (): Promise<apiTypes.Skill[]> =>
    apiService.get("/skills"),

  createSkill: (data: apiTypes.CreateSkillRequest): Promise<{ message: string }> =>
    apiService.post("/skills", data),

  deleteSkill: (skill: string): Promise<void> =>
    apiService.delete(`/skills/${skill}`),
};

// Inclusion API functions
export const inclusionApi = {
  getAllInclusions: (): Promise<apiTypes.Inclusion[]> =>
    apiService.get("/inclusions"),

  createInclusions: (data: apiTypes.CreateInclusionsRequest): Promise<{ message: string }> =>
    apiService.post("/inclusions", data),

  deleteInclusion: (inclusion: string): Promise<void> =>
    apiService.delete(`/inclusions?inclusion=${encodeURIComponent(inclusion)}`),
};

// Exclusion API functions
export const exclusionApi = {
  getAllExclusions: (): Promise<apiTypes.Exclusion[]> =>
    apiService.get("/exclusions"),

  createExclusions: (data: apiTypes.CreateExclusionsRequest): Promise<{ message: string }> =>
    apiService.post("/exclusions", data),

  deleteExclusion: (exclusion: string): Promise<void> =>
    apiService.delete(`/exclusions?exclusion=${encodeURIComponent(exclusion)}`),
};

// Filter API functions
export const filterApi = {
  toggleActive: (data: apiTypes.ToggleActiveRequest): Promise<void> =>
    apiService.patch("/filters/active", data),

  setInclusionsActive: (data: apiTypes.SetActiveRequest): Promise<void> =>
    apiService.patch("/filters/inclusions", data),

  setExclusionsActive: (data: apiTypes.SetActiveRequest): Promise<void> =>
    apiService.patch("/filters/exclusions", data),

  setUserInclusionActive: (data: apiTypes.SetUserFilterActiveRequest): Promise<void> =>
    apiService.patch("/filters/user-inclusions/active", data),

  setUserExclusionActive: (data: apiTypes.SetUserFilterActiveRequest): Promise<void> =>
    apiService.patch("/filters/user-exclusions/active", data),
};

// Resume API functions
export const resumeApi = {
  getResume: (): Promise<apiTypes.Resume> => apiService.get("/resumes"),

  createResume: (data: apiTypes.CreateResumeRequest): Promise<apiTypes.Resume> =>
    apiService.post("/resumes", data),

  updateResume: (data: apiTypes.UpdateResumeRequest): Promise<apiTypes.Resume> =>
    apiService.put("/resumes", data),

  addResumeSkills: (data: apiTypes.AddResumeSkillsRequest): Promise<apiTypes.MessageResponse> =>
    apiService.post("/resumes/skills", data),

  deleteResumeSkill: (skill: string | number): Promise<void> =>
    apiService.delete(`/resumes/skills/${encodeURIComponent(String(skill))}`),

  deleteResume: (): Promise<void> => apiService.delete("/resumes"),

  parseResume: (formData: FormData): Promise<apiTypes.ExpandedResume> =>
    apiService.post("/resumes/parseResume", formData),
};

// Combined export for easy access
export const api = {
  jobs: jobApi,
  jobDescriptions: jobDescriptionApi,
  users: userApi,
  keywords: keywordApi,
  skills: skillApi,
  inclusions: inclusionApi,
  exclusions: exclusionApi,
  filters: filterApi,
  resumes: resumeApi,
};

// Default export
export default api;
