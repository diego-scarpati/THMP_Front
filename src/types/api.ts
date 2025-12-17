// Base types for API responses
export interface BaseEntity {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: "success" | "error";
}

// Error types
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

// ===== JOB INTERFACES =====

export interface Job {
  id: string;
  title: string;
  url: string;
  reference_id?: string;
  poster_id?: string;
  company: string;
  location?: string;
  type?: string;
  post_date?: string;
  benefits?: string;
  approved_by_formula: "yes" | "no" | "pending";
  approved_by_gpt: "yes" | "no" | "pending";
  easy_apply: "yes" | "no" | "pending";
  posted_by: string;
  JobDescription: JobDescription | null;
  Keywords: Keyword[];
  // Relations not explicitly in shared schema but likely returned or used in frontend
  Users?: User[];
  userJobs?: UserJob[];
}

export interface CreateJobRequest {
  title: string;
  url: string;
  reference_id?: string;
  poster_id?: string;
  company: string;
  location?: string;
  type?: string;
  post_date?: string;
  benefits?: string;
  easy_apply?: "yes" | "no" | "pending";
  posted_by?: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {}

export interface JobResponse extends ApiResponse<Job> {}
export interface JobsResponse extends ApiResponse<Job[]> {}
export interface PaginatedJobsResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  jobs: Job[];
}

// ===== JOB DESCRIPTION INTERFACES =====

export interface JobDescription {
  id: string; // job id
  state: string;
  description: string;
  company_apply_url?: string;
  easy_apply_url?: string;
  work_remote_allowed?: boolean;
  work_place?: string;
  formatted_experience_level?: string;
  skills?: string;
  job?: Job;
}

export interface CreateJobDescriptionRequest {
  jobDescription: JobDescription;
}

export interface UpdateJobDescriptionRequest
  extends Partial<Omit<JobDescription, "id">> {}

export interface JobDescriptionResponse extends ApiResponse<JobDescription> {}
export interface JobDescriptionsResponse
  extends ApiResponse<JobDescription[]> {}

// ===== USER INTERFACES =====

export interface User {
  id: string; // uuid
  name: string;
  last_name: string;
  email: string;
  // Relations
  UserJob?: UserJob;
  UserSkills?: UserSkill[];
  UserExclusions?: UserExclusion[];
  UserInclusions?: UserInclusion[];
}

export interface CreateUserRequest {
  userData: {
    name: string;
    last_name: string;
    email: string;
    password: string;
  };
}

export interface UpdateUserRequest {
  name?: string;
  last_name?: string;
  email?: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse
  extends ApiResponse<{
    user: Omit<User, "password">;
    accessToken: string;
  }> {}

export interface UserResponse extends ApiResponse<User> {}
export interface UsersResponse extends ApiResponse<User[]> {}

// ===== USER JOB INTERFACES =====

export interface UserJob extends BaseEntity {
  id: number;
  user_id: string;
  job_id: string;
  approved_by_formula: "yes" | "no" | "pending";
  approved_by_gpt: "yes" | "no" | "pending";
  cover_letter?: string;
  User?: User;
  Job?: Job;
}

export interface CreateUserJobRequest {
  user_id: string;
  job_id: string;
  approved_by_formula?: "yes" | "no" | "pending";
  approved_by_gpt?: "yes" | "no" | "pending";
  cover_letter?: string;
}

export interface UpdateUserJobRequest
  extends Partial<Omit<CreateUserJobRequest, "user_id" | "job_id">> {}

export interface UserJobResponse extends ApiResponse<UserJob> {}
export interface UserJobsResponse extends ApiResponse<UserJob[]> {}

// ===== KEYWORD INTERFACES =====

export interface Keyword {
  id: number;
  keyword: string;
}

export interface CreateKeywordRequest {
  keyword: string;
}

export interface UpdateKeywordRequest extends Partial<CreateKeywordRequest> {}

export interface KeywordResponse extends ApiResponse<Keyword> {}
export interface KeywordsResponse extends ApiResponse<Keyword[]> {}

// ===== SKILL INTERFACES =====

export interface Skill {
  id: number;
  title: string;
  active: boolean;
}

export interface CreateSkillRequest {
  skills: string[];
}

export interface UpdateSkillRequest extends Partial<CreateSkillRequest> {}

export interface SkillResponse extends ApiResponse<Skill> {}
export interface SkillsResponse extends ApiResponse<Skill[]> {}

// ===== INCLUSION INTERFACES =====

export interface Inclusion {
  id: number;
  title: string;
  active: boolean;
}

export interface CreateInclusionsRequest {
  inclusions: string[];
}

export interface InclusionResponse extends ApiResponse<Inclusion> {}
export interface InclusionsResponse extends ApiResponse<Inclusion[]> {}

// ===== EXCLUSION INTERFACES =====

export interface Exclusion {
  id: number;
  title: string;
  active: boolean;
}

export interface CreateExclusionsRequest {
  exclusions: string[];
}

export interface ExclusionResponse extends ApiResponse<Exclusion> {}
export interface ExclusionsResponse extends ApiResponse<Exclusion[]> {}

// ===== USER SKILL INTERFACES =====

export interface UserSkill extends BaseEntity {
  id: number;
  user_id: string;
  skill_id: number;
  user?: User;
  skill?: Skill;
}

export interface CreateUserSkillRequest {
  user_id: string;
  skill_id: number;
}

export interface UserSkillResponse extends ApiResponse<UserSkill> {}
export interface UserSkillsResponse extends ApiResponse<UserSkill[]> {}

// ===== USER EXCLUSION INTERFACES =====

export interface UserExclusion extends BaseEntity {
  id: number;
  user_id: string;
  exclusion_id: number;
  user?: User;
  exclusion?: Exclusion;
}

export interface CreateUserExclusionRequest {
  user_id: string;
  exclusion_id: number;
}

export interface UserExclusionResponse extends ApiResponse<UserExclusion> {}
export interface UserExclusionsResponse extends ApiResponse<UserExclusion[]> {}

// ===== USER INCLUSION INTERFACES =====

export interface UserInclusion extends BaseEntity {
  id: number;
  user_id: string;
  inclusion_id: number;
  user?: User;
  inclusion?: Inclusion;
}

export interface CreateUserInclusionRequest {
  user_id: string;
  inclusion_id: number;
}

export interface UserInclusionResponse extends ApiResponse<UserInclusion> {}
export interface UserInclusionsResponse extends ApiResponse<UserInclusion[]> {}

// ===== RESUME INTERFACES =====

export interface Resume {
  id: number;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  summary?: string;
  educations?: Education[];
  work_experiences?: WorkExperience[];
  resume_skills?: ResumeSkill[];
  certifications?: Certification[];
  projects?: Project[];
  hobbies?: Hobby[];
  languages?: Language[];
  references?: Reference[];
}

export interface Education {
  id: number;
  resume_id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

export interface WorkExperience {
  id: number;
  resume_id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

export interface ResumeSkill {
  id: number;
  resume_id: number;
  skill_id: number;
  Skill?: Skill;
}

export interface Certification {
  id: number;
  resume_id: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
}

export interface Project {
  id: number;
  resume_id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface Hobby {
  id: number;
  resume_id: number;
  hobby: string;
}

export interface Language {
  id: number;
  resume_id: number;
  language: string;
  proficiency: string;
}

export interface Reference {
  id: number;
  resume_id: number;
  name: string;
  relationship: string;
  contact: string;
}

export interface CreateResumeRequest extends Omit<Resume, "id" | "user_id"> {}
export interface UpdateResumeRequest extends Partial<CreateResumeRequest> {}

export interface ResumeResponse extends ApiResponse<Resume> {}

// ===== SPECIALIZED REQUEST/RESPONSE INTERFACES =====

export interface BulkCreateJobsRequest {
  jobsInfoArray: CreateJobRequest[];
  keywords: string[];
}

export interface SearchAndCreateJobsRequest {
  keywords: string;
  location?: string;
  datePosted?: string;
  sort?: string;
}

export interface SearchAndCreateJobsMultipleKeywordsRequest {
  keywords?: string[];
  location?: string;
  datePosted?: string;
  sort?: string;
}

export interface SearchAndCreateJobsResponse extends ApiResponse<string> {}

export interface JobAcceptanceFilterParams {
  formulaAcceptance?: "yes" | "no" | "pending";
  gptAcceptance?: "yes" | "no" | "pending";
}

export interface JobQueryParams {
  page?: number;
  limit?: number;
  created?: string;
  post_date?: string;
  job_descriptions?: boolean;
  skills?: boolean;
  keywords?: boolean;
  approved_by_formula?: "yes" | "no" | "pending";
  approved_by_gpt?: "yes" | "no" | "pending";
  easy_apply?: "yes" | "no" | "pending";
  company?: string;
  title?: string;
  location?: string;
  type?: string;
}

// ===== NEW INTERFACES FROM API REFERENCE =====

// SEEK scraping request interfaces
export interface SeekSearchRequest {
  keywords: string[];
  location?: string; // defaults to 'sydney'
}

export interface SeekAllKeywordsRequest {
  keywordArray?: string[]; // optional subset of stored keywords
  location?: string;
}

// Approval operations response
export interface ApprovalResponse {
  jobsProcessed: number;
}

// User job approval update request
export interface UpdateUserJobsApprovalRequest {
  // No body params - updates all to pending
}

export interface UpdateUserJobsApprovalResponse {
  updatedRows: number;
}

// Inclusion DELETE uses query param
export interface DeleteInclusionRequest {
  inclusion: string; // query param
}

// Filter API interfaces
export interface ToggleActiveRequest {
  includes?: string[];
  excludes?: string[];
}

export interface SetActiveRequest {
  titles: string[];
  active: boolean;
}