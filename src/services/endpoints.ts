import { apiService } from './api'
import * as apiTypes from '@/types/api'

// Job API functions
export const jobApi = {
  getAllJobs: (params?: apiTypes.JobQueryParams): Promise<apiTypes.PaginatedResponse<apiTypes.Job>> =>
    apiService.get('/jobs/getAll', {
      headers: { 'Cache-Control': 'no-cache' },
      ...(params ? { params } : {})
    }),

  getJobById: (id: string): Promise<apiTypes.ApiResponse<apiTypes.Job>> =>
    apiService.get(`/jobs/getJobById/${id}`),

  getJobsByCompanyName: (companyName: string): Promise<apiTypes.ApiResponse<apiTypes.Job[]>> =>
    apiService.get(`/jobs/getJobsByCompanyName/${companyName}`),

  getAllByAcceptance: (params: apiTypes.JobAcceptanceFilterParams): Promise<apiTypes.ApiResponse<apiTypes.Job[]>> =>
    apiService.get('/jobs/getAllByAccepetance', {
      headers: { 'Cache-Control': 'no-cache' },
      ...(params ? { params } : {})
    }),

  getAllApplied: (): Promise<apiTypes.ApiResponse<apiTypes.Job[]>> =>
    apiService.get('/jobs/getAllApplied'),

  getAllRejected: (): Promise<apiTypes.ApiResponse<apiTypes.Job[]>> =>
    apiService.get('/jobs/getAllRejected'),

  createJob: (jobData: apiTypes.CreateJobRequest): Promise<apiTypes.ApiResponse<apiTypes.Job>> =>
    apiService.post('/jobs/create', jobData),

  updateJob: (id: string, jobData: apiTypes.UpdateJobRequest): Promise<apiTypes.ApiResponse<apiTypes.Job>> =>
    apiService.put(`/jobs/update/${id}`, jobData),

  deleteJob: (id: string): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/jobs/delete/${id}`),

  bulkCreateJobs: (data: apiTypes.BulkCreateJobsRequest): Promise<apiTypes.ApiResponse<string>> =>
    apiService.post('/jobs/bulkCreate', data),

  searchAndCreateJobs: (data: apiTypes.SearchAndCreateJobsRequest): Promise<apiTypes.SearchAndCreateJobsResponse> =>
    apiService.post('/jobs/searchAndCreate', data),

  searchAndCreateWithAllKeywords: (): Promise<apiTypes.SearchAndCreateJobsResponse> =>
    apiService.post('/jobs/searchAndCreateWithAllKeywords'),

  approveByGPT: (): Promise<apiTypes.ApiResponse<string>> =>
    apiService.patch('/jobs/approveByGPT'),

  approveByFormula: (): Promise<apiTypes.ApiResponse<string>> =>
    apiService.patch('/jobs/approveByFormula'),

  updateApprovedByDate: (): Promise<apiTypes.ApiResponse<string>> =>
    apiService.patch('/jobs/updateApprovedByDate'),

  saveJobsToFile: (): Promise<apiTypes.ApiResponse<string>> =>
    apiService.get('/jobs/saveJobsToFile'),
}

// Job Description API functions
export const jobDescriptionApi = {
  getAllJobDescriptions: (): Promise<apiTypes.ApiResponse<apiTypes.JobDescription[]>> =>
    apiService.get('/jobDescriptions/getAll'),

  getJobDescriptionById: (id: string): Promise<apiTypes.ApiResponse<apiTypes.JobDescription>> =>
    apiService.get(`/jobDescriptions/getById/${id}`),

  createJobDescription: (data: apiTypes.CreateJobDescriptionRequest): Promise<apiTypes.ApiResponse<apiTypes.JobDescription>> =>
    apiService.post('/jobDescriptions/create', data),

  updateJobDescription: (id: string, data: apiTypes.UpdateJobDescriptionRequest): Promise<apiTypes.ApiResponse<apiTypes.JobDescription>> =>
    apiService.put(`/jobDescriptions/update/${id}`, data),

  deleteJobDescription: (id: string): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/jobDescriptions/delete/${id}`),

  loopAndCreateJobDescription: (): Promise<apiTypes.ApiResponse<string>> =>
    apiService.post('/jobDescriptions/loopAndCreate'),
}

// User API functions
export const userApi = {
  createUser: (userData: apiTypes.CreateUserRequest): Promise<apiTypes.ApiResponse<apiTypes.User>> =>
    apiService.post('/users/createUser', userData),

  loginUser: (credentials: apiTypes.LoginRequest): Promise<apiTypes.LoginResponse> =>
    apiService.post('/users/loginUser', credentials),

  getUserById: (id: string): Promise<apiTypes.ApiResponse<apiTypes.User>> =>
    apiService.get(`/users/${id}`),

  updateUser: (id: string, userData: apiTypes.UpdateUserRequest): Promise<apiTypes.ApiResponse<apiTypes.User>> =>
    apiService.put(`/users/${id}`, userData),

  deleteUser: (id: string): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/users/${id}`),

  getCurrentUser: (): Promise<apiTypes.ApiResponse<apiTypes.User>> =>
    apiService.get('/users/me'),
}

// User Job API functions
export const userJobApi = {
  getUserJobs: (userId: string): Promise<apiTypes.ApiResponse<apiTypes.UserJob[]>> =>
    apiService.get(`/userJobs/user/${userId}`),

  getJobUsers: (jobId: string): Promise<apiTypes.ApiResponse<apiTypes.UserJob[]>> =>
    apiService.get(`/userJobs/job/${jobId}`),

  createUserJob: (data: apiTypes.CreateUserJobRequest): Promise<apiTypes.ApiResponse<apiTypes.UserJob>> =>
    apiService.post('/userJobs/create', data),

  updateUserJob: (id: number, data: apiTypes.UpdateUserJobRequest): Promise<apiTypes.ApiResponse<apiTypes.UserJob>> =>
    apiService.put(`/userJobs/update/${id}`, data),

  deleteUserJob: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/userJobs/delete/${id}`),

  updateCoverLetter: (id: number, coverLetter: string): Promise<apiTypes.ApiResponse<apiTypes.UserJob>> =>
    apiService.patch(`/userJobs/updateCoverLetter/${id}`, { cover_letter: coverLetter }),

  updateApprovalStatus: (id: number, data: { approved_by_formula?: string, approved_by_gpt?: string }): Promise<apiTypes.ApiResponse<apiTypes.UserJob>> =>
    apiService.patch(`/userJobs/updateApprovalStatus/${id}`, data),
}

// Keyword API functions
export const keywordApi = {
  getAllKeywords: (): Promise<apiTypes.ApiResponse<apiTypes.Keyword[]>> =>
    apiService.get('/keywords/getAll'),

  getKeywordById: (id: number): Promise<apiTypes.ApiResponse<apiTypes.Keyword>> =>
    apiService.get(`/keywords/getById/${id}`),

  createKeyword: (data: apiTypes.CreateKeywordRequest): Promise<apiTypes.ApiResponse<apiTypes.Keyword>> =>
    apiService.post('/keywords/create', data),

  updateKeyword: (id: number, data: apiTypes.UpdateKeywordRequest): Promise<apiTypes.ApiResponse<apiTypes.Keyword>> =>
    apiService.put(`/keywords/update/${id}`, data),

  deleteKeyword: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/keywords/delete/${id}`),
}

// Skill API functions
export const skillApi = {
  getAllSkills: (): Promise<apiTypes.ApiResponse<apiTypes.Skill[]>> =>
    apiService.get('/skills/getAll'),

  getSkillById: (id: number): Promise<apiTypes.ApiResponse<apiTypes.Skill>> =>
    apiService.get(`/skills/getById/${id}`),

  createSkill: (data: apiTypes.CreateSkillRequest): Promise<apiTypes.ApiResponse<apiTypes.Skill>> =>
    apiService.post('/skills/create', data),

  updateSkill: (id: number, data: apiTypes.UpdateSkillRequest): Promise<apiTypes.ApiResponse<apiTypes.Skill>> =>
    apiService.put(`/skills/update/${id}`, data),

  deleteSkill: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/skills/delete/${id}`),
}

// Inclusion API functions
export const inclusionApi = {
  getAllInclusions: (): Promise<apiTypes.ApiResponse<apiTypes.Inclusion[]>> =>
    apiService.get('/inclusions'),

  createInclusions: (data: apiTypes.CreateInclusionsRequest): Promise<apiTypes.ApiResponse<string>> =>
    apiService.post('/inclusions', data),

  deleteInclusion: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/inclusions/${id}`),
}

// Exclusion API functions
export const exclusionApi = {
  getAllExclusions: (): Promise<apiTypes.ApiResponse<apiTypes.Exclusion[]>> =>
    apiService.get('/exclusions'),

  createExclusions: (data: apiTypes.CreateExclusionsRequest): Promise<apiTypes.ApiResponse<string>> =>
    apiService.post('/exclusions', data),

  deleteExclusion: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/exclusions/${id}`),
}

// User Skill API functions
export const userSkillApi = {
  getUserSkills: (userId: string): Promise<apiTypes.ApiResponse<apiTypes.UserSkill[]>> =>
    apiService.get(`/userSkills/user/${userId}`),

  createUserSkill: (data: apiTypes.CreateUserSkillRequest): Promise<apiTypes.ApiResponse<apiTypes.UserSkill>> =>
    apiService.post('/userSkills/create', data),

  updateUserSkill: (id: number, data: Partial<apiTypes.CreateUserSkillRequest>): Promise<apiTypes.ApiResponse<apiTypes.UserSkill>> =>
    apiService.put(`/userSkills/update/${id}`, data),

  deleteUserSkill: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/userSkills/delete/${id}`),
}

// User Exclusion API functions
export const userExclusionApi = {
  getUserExclusions: (userId: string): Promise<apiTypes.ApiResponse<apiTypes.UserExclusion[]>> =>
    apiService.get(`/userExclusions/user/${userId}`),

  createUserExclusion: (data: apiTypes.CreateUserExclusionRequest): Promise<apiTypes.ApiResponse<apiTypes.UserExclusion>> =>
    apiService.post('/userExclusions/create', data),

  deleteUserExclusion: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/userExclusions/delete/${id}`),
}

// User Inclusion API functions
export const userInclusionApi = {
  getUserInclusions: (userId: string): Promise<apiTypes.ApiResponse<apiTypes.UserInclusion[]>> =>
    apiService.get(`/userInclusions/user/${userId}`),

  createUserInclusion: (data: apiTypes.CreateUserInclusionRequest): Promise<apiTypes.ApiResponse<apiTypes.UserInclusion>> =>
    apiService.post('/userInclusions/create', data),

  deleteUserInclusion: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/userInclusions/delete/${id}`),
}

// Resume API functions
export const resumeApi = {
  getAllResumes: (): Promise<apiTypes.ApiResponse<apiTypes.Resume[]>> =>
    apiService.get('/resumes'),

  getResumeById: (id: number): Promise<apiTypes.ApiResponse<apiTypes.Resume>> =>
    apiService.get(`/resumes/${id}`),

  getResumesByUser: (userId: string): Promise<apiTypes.ApiResponse<apiTypes.Resume[]>> =>
    apiService.get(`/resumes/user/${userId}`),

  createResume: (data: apiTypes.CreateResumeRequest): Promise<apiTypes.ApiResponse<apiTypes.Resume>> =>
    apiService.post('/resumes/create', data),

  updateResume: (id: number, data: apiTypes.UpdateResumeRequest): Promise<apiTypes.ApiResponse<apiTypes.Resume>> =>
    apiService.put(`/resumes/update/${id}`, data),

  deleteResume: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/resumes/delete/${id}`),
}

// Education API functions
export const educationApi = {
  getEducationsByResume: (resumeId: number): Promise<apiTypes.ApiResponse<apiTypes.Education[]>> =>
    apiService.get(`/education/resume/${resumeId}`),

  createEducation: (data: any): Promise<apiTypes.ApiResponse<apiTypes.Education>> =>
    apiService.post('/education/create', data),

  updateEducation: (id: number, data: any): Promise<apiTypes.ApiResponse<apiTypes.Education>> =>
    apiService.put(`/education/update/${id}`, data),

  deleteEducation: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/education/delete/${id}`),
}

// Work Experience API functions
export const workExperienceApi = {
  getWorkExperiencesByResume: (resumeId: number): Promise<apiTypes.ApiResponse<apiTypes.WorkExperience[]>> =>
    apiService.get(`/workExperience/resume/${resumeId}`),

  createWorkExperience: (data: any): Promise<apiTypes.ApiResponse<apiTypes.WorkExperience>> =>
    apiService.post('/workExperience/create', data),

  updateWorkExperience: (id: number, data: any): Promise<apiTypes.ApiResponse<apiTypes.WorkExperience>> =>
    apiService.put(`/workExperience/update/${id}`, data),

  deleteWorkExperience: (id: number): Promise<apiTypes.ApiResponse<{ success: boolean }>> =>
    apiService.delete(`/workExperience/delete/${id}`),
}

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
}

// Default export
export default api