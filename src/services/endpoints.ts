import { apiService } from "./api";
import * as apiTypes from "@/types/api";

// Helper to build query string
const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
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
    return apiService.get(`/jobs/getAll${queryString}`, {
      headers: { "Cache-Control": "no-cache" },
    });
  },

  getJobById: (id: string): Promise<apiTypes.Job> =>
    apiService.get(`/jobs/getJobById/${id}`),

  getJobsByCompanyName: (companyName: string): Promise<apiTypes.Job[]> =>
    apiService.get(`/jobs/getJobsByCompanyName/${companyName}`),

  getAllByAcceptance: (
    params: apiTypes.JobAcceptanceFilterParams
  ): Promise<apiTypes.Job[]> => {
    const queryString = buildQueryString(params);
    return apiService.get(`/jobs/getAllByAccepetance${queryString}`, {
      headers: { "Cache-Control": "no-cache" },
    });
  },

  getAllApplied: (): Promise<apiTypes.Job[]> =>
    apiService.get("/jobs/getAllApplied"),

  getAllRejected: (): Promise<apiTypes.Job[]> =>
    apiService.get("/jobs/getAllRejected"),

  createJob: (jobData: apiTypes.CreateJobRequest): Promise<apiTypes.Job> =>
    apiService.post("/jobs/create", jobData),

  updateJob: (
    id: string,
    jobData: apiTypes.UpdateJobRequest
  ): Promise<apiTypes.Job> => apiService.put(`/jobs/update/${id}`, jobData),

  deleteJob: (id: string): Promise<{ success: boolean }> =>
    apiService.delete(`/jobs/delete/${id}`),

  bulkCreateJobs: (data: apiTypes.BulkCreateJobsRequest): Promise<string> =>
    apiService.post("/jobs/bulkCreate", data),

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

  saveJobsToFile: (): Promise<string> => apiService.get("/jobs/saveJobsToFile"),

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

  updateJobDescription: (
    id: string,
    data: apiTypes.UpdateJobDescriptionRequest
  ): Promise<apiTypes.JobDescription> =>
    apiService.put(`/jobDescriptions/update/${id}`, data),

  deleteJobDescription: (id: string): Promise<{ success: boolean }> =>
    apiService.delete(`/jobDescriptions/delete/${id}`),

  loopAndCreateJobDescription: (): Promise<string> =>
    apiService.post("/jobDescriptions/loopAndCreate"),
};

// User API functions
export const userApi = {
  createUser: (userData: apiTypes.CreateUserRequest): Promise<apiTypes.User> =>
    apiService.post("/users/createUser", userData),

  loginUser: (
    credentials: apiTypes.LoginRequest
  ): Promise<apiTypes.LoginResponse> =>
    apiService.post("/users/loginUser", credentials),

  getUserById: (id: string): Promise<apiTypes.User> =>
    apiService.get(`/users/${id}`),

  updateUser: (
    id: string,
    userData: apiTypes.UpdateUserRequest
  ): Promise<apiTypes.User> => apiService.put(`/users/${id}`, userData),

  deleteUser: (id: string): Promise<{ success: boolean }> =>
    apiService.delete(`/users/${id}`),

  getCurrentUser: (): Promise<apiTypes.User> => apiService.get("/users/me"),

  getUserKeywords: (): Promise<string[]> => apiService.get("/users/keywords"),
};

// User Job API functions
export const userJobApi = {
  getUserJobs: (userId: string): Promise<apiTypes.UserJob[]> =>
    apiService.get(`/userJobs/user/${userId}`),

  getJobUsers: (jobId: string): Promise<apiTypes.UserJob[]> =>
    apiService.get(`/userJobs/job/${jobId}`),

  createUserJob: (
    data: apiTypes.CreateUserJobRequest
  ): Promise<apiTypes.UserJob> => apiService.post("/userJobs/create", data),

  updateUserJob: (
    id: number,
    data: apiTypes.UpdateUserJobRequest
  ): Promise<apiTypes.UserJob> =>
    apiService.put(`/userJobs/update/${id}`, data),

  deleteUserJob: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/userJobs/delete/${id}`),

  updateCoverLetter: (
    id: number,
    coverLetter: string
  ): Promise<apiTypes.UserJob> =>
    apiService.patch(`/userJobs/updateCoverLetter/${id}`, {
      cover_letter: coverLetter,
    }),

  updateApprovalStatus: (
    id: number,
    data: { approved_by_formula?: string; approved_by_gpt?: string }
  ): Promise<apiTypes.UserJob> =>
    apiService.patch(`/userJobs/updateApprovalStatus/${id}`, data),
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

  updateKeyword: (
    id: number,
    data: apiTypes.UpdateKeywordRequest
  ): Promise<apiTypes.Keyword> =>
    apiService.put(`/keywords/update/${id}`, data),

  deleteKeyword: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/keywords/delete/${id}`),
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
};

// Resume API functions
export const resumeApi = {
  getResume: (): Promise<apiTypes.Resume> => apiService.get("/resumes"),

  createResume: (data: apiTypes.CreateResumeRequest): Promise<apiTypes.Resume> =>
    apiService.post("/resumes", data),

  updateResume: (data: apiTypes.UpdateResumeRequest): Promise<apiTypes.Resume> =>
    apiService.put("/resumes", data),

  deleteResume: (): Promise<void> => apiService.delete("/resumes"),
};

// Combined export for easy access
export const api = {
  jobs: jobApi,
  jobDescriptions: jobDescriptionApi,
  users: userApi,
  userJobs: userJobApi,
  keywords: keywordApi,
  skills: skillApi,
  inclusions: inclusionApi,
  exclusions: exclusionApi,
  filters: filterApi,
  resumes: resumeApi,
};

// Default export
export default api;
