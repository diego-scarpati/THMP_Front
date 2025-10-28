// Base types for API responses
export interface BaseEntity {
  id: string | number;
  createdAt: string;
  updatedAt: string;
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

export interface Job extends BaseEntity {
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
  easy_apply?: "yes" | "no" | "pending";
  posted_by: string;
  JobDescription?: JobDescription;
  Users?: User[];
  keywords?: Keyword[];
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
export interface PaginatedJobsResponse extends PaginatedResponse<Job> {}

// ===== JOB DESCRIPTION INTERFACES =====

export interface JobDescription extends BaseEntity {
  id: string;
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
  id: string;
  state: string;
  description: string;
  company_apply_url?: string;
  easy_apply_url?: string;
  work_remote_allowed?: boolean;
  work_place?: string;
  formatted_experience_level?: string;
  skills?: string;
}

export interface UpdateJobDescriptionRequest
  extends Partial<Omit<CreateJobDescriptionRequest, "id">> {}

export interface JobDescriptionResponse extends ApiResponse<JobDescription> {}
export interface JobDescriptionsResponse
  extends ApiResponse<JobDescription[]> {}

// ===== USER INTERFACES =====

export interface User extends BaseEntity {
  id: string;
  name: string;
  last_name: string;
  email: string;
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

export interface Keyword extends BaseEntity {
  id: number;
  keyword: string;
  jobs?: Job[];
}

export interface CreateKeywordRequest {
  keyword: string;
}

export interface UpdateKeywordRequest extends Partial<CreateKeywordRequest> {}

export interface KeywordResponse extends ApiResponse<Keyword> {}
export interface KeywordsResponse extends ApiResponse<Keyword[]> {}

// ===== SKILL INTERFACES =====

export interface Skill extends BaseEntity {
  id: number;
  name: string;
  users?: User[];
}

export interface CreateSkillRequest {
  name: string;
}

export interface UpdateSkillRequest extends Partial<CreateSkillRequest> {}

export interface SkillResponse extends ApiResponse<Skill> {}
export interface SkillsResponse extends ApiResponse<Skill[]> {}

// ===== INCLUSION INTERFACES =====

export interface Inclusion extends BaseEntity {
  id: number;
  title: string;
  users?: User[];
}

export interface CreateInclusionsRequest {
  inclusions: string[];
}

export interface InclusionResponse extends ApiResponse<Inclusion> {}
export interface InclusionsResponse extends ApiResponse<Inclusion[]> {}

// ===== EXCLUSION INTERFACES =====

export interface Exclusion extends BaseEntity {
  id: number;
  title: string;
  users?: User[];
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

export interface Resume extends BaseEntity {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  summary?: string;
  educations?: Education[];
  workExperiences?: WorkExperience[];
  skills?: ResumeSkill[];
  certifications?: Certification[];
  projects?: Project[];
  hobbies?: Hobby[];
  languages?: Language[];
  references?: Reference[];
}

export interface CreateResumeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  summary?: string;
}

export interface UpdateResumeRequest extends Partial<CreateResumeRequest> {}

export interface ResumeResponse extends ApiResponse<Resume> {}
export interface ResumesResponse extends ApiResponse<Resume[]> {}

// ===== EDUCATION INTERFACES =====

export interface Education extends BaseEntity {
  id: number;
  resume_id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
  resume?: Resume;
}

export interface CreateEducationRequest {
  resume_id: number;
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string;
}

export interface UpdateEducationRequest
  extends Partial<Omit<CreateEducationRequest, "resume_id">> {}

// ===== WORK EXPERIENCE INTERFACES =====

export interface WorkExperience extends BaseEntity {
  id: number;
  resume_id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
  resume?: Resume;
}

export interface CreateWorkExperienceRequest {
  resume_id: number;
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  responsibilities: string[];
}

export interface UpdateWorkExperienceRequest
  extends Partial<Omit<CreateWorkExperienceRequest, "resume_id">> {}

// ===== OTHER RESUME RELATED INTERFACES =====

export interface ResumeSkill extends BaseEntity {
  id: number;
  resume_id: number;
  skill: string;
}

export interface Certification extends BaseEntity {
  id: number;
  resume_id: number;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string;
}

export interface Project extends BaseEntity {
  id: number;
  resume_id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

export interface Hobby extends BaseEntity {
  id: number;
  resume_id: number;
  hobby: string;
}

export interface Language extends BaseEntity {
  id: number;
  resume_id: number;
  language: string;
  proficiency: string;
}

export interface Reference extends BaseEntity {
  id: number;
  resume_id: number;
  name: string;
  relationship: string;
  contact: string;
}

// ===== SPECIALIZED REQUEST/RESPONSE INTERFACES =====

export interface BulkCreateJobsRequest {
  jobsInfoArray: CreateJobRequest[];
  keywords: string[];
}

export interface SearchAndCreateJobsRequest {
  keywords: string;
  locationId?: number;
}

export interface SearchAndCreateJobsMultipleKeywordsRequest {
  keywords?: string[];
  locationId?: number;
}

export interface SearchAndCreateJobsResponse extends ApiResponse<string> {}

export interface JobAcceptanceFilterParams {
  formulaAcceptance?: "yes" | "no" | "pending";
  gptAcceptance?: "yes" | "no" | "pending";
}

export interface JobQueryParams extends PaginationParams {
  // Job model parameters
  id?: string;
  title?: string;
  url?: string;
  reference_id?: string;
  poster_id?: string;
  company?: string;
  location?: string;
  type?: string;
  post_date?: string;
  benefits?: string;
  approved_by_formula?: "yes" | "no" | "pending";
  approved_by_gpt?: "yes" | "no" | "pending";
  easy_apply?: "yes" | "no" | "pending";

  // Include parameters
  keywords?: boolean;
  jobDescriptions?: boolean;
  skills?: boolean;

  // Additional query parameters
  created?: string;
}

export interface PaginatedManualJobsResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  jobs: Job[];
}
