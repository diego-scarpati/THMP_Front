import { apiService } from "./api";
import * as apiTypes from "@/types/api";

// Job API functions
export const jobApi = {
  getAllJobs: (
    params?: apiTypes.JobQueryParams
  ): Promise<apiTypes.PaginatedManualJobsResponse> => {
    // Should check if params is defined and is not null
    // If params is defined, it will be included in the request
    // Otherwise, it will be omitted
    // This allows for optional parameters in the API call
    let queryParams = "";
    if (params && Object.keys(params).length > 0) {
      queryParams = new URLSearchParams(
        params as Record<string, string>
      ).toString();
    }

    return apiService.get(
      `/jobs/getAll${queryParams ? `?${queryParams}` : ""}`,
      {
        headers: { "Cache-Control": "no-cache" },
        ...(params ? { params } : {}),
      }
    );
  },

  getJobById: (id: string): Promise<apiTypes.Job> =>
    apiService.get(`/jobs/getJobById/${id}`),

  getJobsByCompanyName: (companyName: string): Promise<apiTypes.Job[]> =>
    apiService.get(`/jobs/getJobsByCompanyName/${companyName}`),

  getAllByAcceptance: (
    params: apiTypes.JobAcceptanceFilterParams
  ): Promise<apiTypes.Job[]> =>
    apiService.get("/jobs/getAllByAccepetance", {
      headers: { "Cache-Control": "no-cache" },
      ...(params ? { params } : {}),
    }),

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

  // TO UPDATE: searchAndCreateJobs should use query params and return plain text
  // Query params: keywords (required), location, datePosted, sort
  // Response: plain text (use responseType: "text" in axios)
  // searchAndCreateJobs: (params: {
  //   keywords: string;
  //   location?: string;
  //   datePosted?: string;
  //   sort?: string;
  // }): Promise<string> =>
  //   apiService.post("/jobs/searchAndCreate", undefined, {
  //     params,
  //     responseType: "text",
  //   }),

  searchAndCreateJobs: (
    data: apiTypes.SearchAndCreateJobsRequest
  ): Promise<apiTypes.SearchAndCreateJobsResponse> =>
    apiService.post("/jobs/searchAndCreate", data),

  // TO UPDATE: searchAndCreateWithAllKeywords should use query params + optional body
  // Query params: location, datePosted, sort
  // Body: { "keywords": string[] } (optional)
  // Response: plain text
  // searchAndCreateWithAllKeywords: (params: {
  //   location?: string;
  //   datePosted?: string;
  //   sort?: string;
  //   keywords?: string[];
  // }): Promise<string> => {
  //   const { keywords, ...queryParams } = params;
  //   return apiService.post(
  //     "/jobs/searchAndCreateWithAllKeywords",
  //     keywords ? { keywords } : undefined,
  //     {
  //       params: queryParams,
  //       responseType: "text",
  //     }
  //   );
  // },

  searchAndCreateWithAllKeywords: (
    data: apiTypes.SearchAndCreateJobsMultipleKeywordsRequest
  ): Promise<apiTypes.SearchAndCreateJobsResponse> =>
    apiService.post("/jobs/searchAndCreateWithAllKeywords", data),

  // TO UPDATE: approveByGPT and approveByFormula return plain text summaries
  // Response: plain text (use responseType: "text")
  // approveByGPT: (): Promise<string> =>
  //   apiService.patch("/jobs/approveByGPT", undefined, { responseType: "text" }),
  // approveByFormula: (): Promise<string> =>
  //   apiService.patch("/jobs/approveByFormula", undefined, { responseType: "text" }),

  approveByGPT: (): Promise<string> => apiService.patch("/jobs/approveByGPT"),

  approveByFormula: (): Promise<string> =>
    apiService.patch("/jobs/approveByFormula"),

  updateApprovedByDate: (): Promise<string> =>
    apiService.patch("/jobs/updateApprovedByDate"),

  saveJobsToFile: (): Promise<string> => apiService.get("/jobs/saveJobsToFile"),

  // TO UPDATE: updateApprovedByDate should return number (count of updated jobs)
  // updateApprovedByDate: (): Promise<number> =>
  //   apiService.patch("/jobs/updateApprovedByDate"),

  // NEW ENDPOINTS FROM API REFERENCE
  updateUserJobsApprovalByFormula:
    (): Promise<apiTypes.UpdateUserJobsApprovalResponse> =>
      apiService.patch("/jobs/updateUserJobsApprovalByFormula"),

  seekSearch: (data: apiTypes.SeekSearchRequest): Promise<string> => {
    const location = data.location || "sydney";
    return apiService.post(
      `/jobs/seek?location=${encodeURIComponent(location)}`,
      data
    );
  },

  seekAllKeywords: (
    data?: apiTypes.SeekAllKeywordsRequest
  ): Promise<string> => {
    const url = data?.location
      ? `/jobs/seekAllKeywords?location=${encodeURIComponent(data.location)}`
      : "/jobs/seekAllKeywords";
    return apiService.post(url, data);
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

  // NEW ENDPOINT FROM API REFERENCE
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
    apiService.get("/skills/getAll"),

  getSkillById: (id: number): Promise<apiTypes.Skill> =>
    apiService.get(`/skills/getById/${id}`),

  createSkill: (data: apiTypes.CreateSkillRequest): Promise<apiTypes.Skill> =>
    apiService.post("/skills/create", data),

  updateSkill: (
    id: number,
    data: apiTypes.UpdateSkillRequest
  ): Promise<apiTypes.Skill> => apiService.put(`/skills/update/${id}`, data),

  deleteSkill: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/skills/delete/${id}`),
};

// Inclusion API functions
export const inclusionApi = {
  getAllInclusions: (): Promise<apiTypes.Inclusion[]> =>
    apiService.get("/inclusions"),

  getAllUserInclusions: (): Promise<apiTypes.Inclusion[]> =>
    apiService.get("/inclusions"),

  createInclusions: (data: apiTypes.CreateInclusionsRequest): Promise<string> =>
    apiService.post("/inclusions", data),

  // TO UPDATE: deleteInclusion should use query param ?inclusion=term
  // Returns 204 on success
  // deleteInclusion: (inclusion: string): Promise<void> =>
  //   apiService.delete("/inclusions", { params: { inclusion } }),

  deleteInclusion: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/inclusions/${id}`),
};

// Exclusion API functions
export const exclusionApi = {
  getAllExclusions: (): Promise<apiTypes.Exclusion[]> =>
    apiService.get("/exclusions"),

  getAllUserExclusions: (): Promise<apiTypes.Exclusion[]> =>
    apiService.get("/exclusions"),

  createExclusions: (data: apiTypes.CreateExclusionsRequest): Promise<string> =>
    apiService.post("/exclusions", data),

  deleteExclusion: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/exclusions/${id}`),
};

// User Skill API functions
export const userSkillApi = {
  getUserSkills: (userId: string): Promise<apiTypes.UserSkill[]> =>
    apiService.get(`/userSkills/user/${userId}`),

  createUserSkill: (
    data: apiTypes.CreateUserSkillRequest
  ): Promise<apiTypes.UserSkill> => apiService.post("/userSkills/create", data),

  updateUserSkill: (
    id: number,
    data: Partial<apiTypes.CreateUserSkillRequest>
  ): Promise<apiTypes.UserSkill> =>
    apiService.put(`/userSkills/update/${id}`, data),

  deleteUserSkill: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/userSkills/delete/${id}`),
};

// User Exclusion API functions
export const userExclusionApi = {
  getUserExclusions: (userId: string): Promise<apiTypes.UserExclusion[]> =>
    apiService.get(`/userExclusions/user/${userId}`),

  createUserExclusion: (
    data: apiTypes.CreateUserExclusionRequest
  ): Promise<apiTypes.UserExclusion> =>
    apiService.post("/userExclusions/create", data),

  deleteUserExclusion: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/userExclusions/delete/${id}`),
};

// User Inclusion API functions
export const userInclusionApi = {
  getUserInclusions: (userId: string): Promise<apiTypes.UserInclusion[]> =>
    apiService.get(`/userInclusions/user/${userId}`),

  createUserInclusion: (
    data: apiTypes.CreateUserInclusionRequest
  ): Promise<apiTypes.UserInclusion> =>
    apiService.post("/userInclusions/create", data),

  deleteUserInclusion: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/userInclusions/delete/${id}`),
};

// Resume API functions
export const resumeApi = {
  getAllResumes: (): Promise<apiTypes.Resume[]> => apiService.get("/resumes"),

  getResumeById: (id: number): Promise<apiTypes.Resume> =>
    apiService.get(`/resumes/${id}`),

  getResumesByUser: (userId: string): Promise<apiTypes.Resume[]> =>
    apiService.get(`/resumes/user/${userId}`),

  createResume: (
    data: apiTypes.CreateResumeRequest
  ): Promise<apiTypes.Resume> => apiService.post("/resumes/create", data),

  updateResume: (
    id: number,
    data: apiTypes.UpdateResumeRequest
  ): Promise<apiTypes.Resume> => apiService.put(`/resumes/update/${id}`, data),

  deleteResume: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/resumes/delete/${id}`),
};

// Education API functions
export const educationApi = {
  getEducationsByResume: (resumeId: number): Promise<apiTypes.Education[]> =>
    apiService.get(`/education/resume/${resumeId}`),

  createEducation: (data: any): Promise<apiTypes.Education> =>
    apiService.post("/education/create", data),

  updateEducation: (id: number, data: any): Promise<apiTypes.Education> =>
    apiService.put(`/education/update/${id}`, data),

  deleteEducation: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/education/delete/${id}`),
};

// Work Experience API functions
export const workExperienceApi = {
  getWorkExperiencesByResume: (
    resumeId: number
  ): Promise<apiTypes.WorkExperience[]> =>
    apiService.get(`/workExperience/resume/${resumeId}`),

  createWorkExperience: (data: any): Promise<apiTypes.WorkExperience> =>
    apiService.post("/workExperience/create", data),

  updateWorkExperience: (
    id: number,
    data: any
  ): Promise<apiTypes.WorkExperience> =>
    apiService.put(`/workExperience/update/${id}`, data),

  deleteWorkExperience: (id: number): Promise<{ success: boolean }> =>
    apiService.delete(`/workExperience/delete/${id}`),
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
  userSkills: userSkillApi,
  userExclusions: userExclusionApi,
  userInclusions: userInclusionApi,
  resumes: resumeApi,
  education: educationApi,
  workExperience: workExperienceApi,
};

// Default export
export default api;
