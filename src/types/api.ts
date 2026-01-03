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
  message?: string;
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

export type UpdateJobRequest = Partial<CreateJobRequest>;

export type JobResponse = ApiResponse<Job>;
export type JobsResponse = ApiResponse<Job[]>;
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

export type UpdateJobDescriptionRequest = Partial<Omit<JobDescription, "id">>;

export type JobDescriptionResponse = ApiResponse<JobDescription>;
export type JobDescriptionsResponse = ApiResponse<JobDescription[]>;

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

// API_REFERENCE.md: LoginResponse is a plain object: { user, accessToken }
export interface LoginResponse {
  user: User;
  accessToken: string;
}

export type UserResponse = ApiResponse<User>;
export type UsersResponse = ApiResponse<User[]>;

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

export type UpdateUserJobRequest = Partial<
  Omit<CreateUserJobRequest, "user_id" | "job_id">
>;

export type UserJobResponse = ApiResponse<UserJob>;
export type UserJobsResponse = ApiResponse<UserJob[]>;

// ===== KEYWORD INTERFACES =====

export interface Keyword {
  id: number;
  keyword: string;
}

export interface CreateKeywordRequest {
  keyword: string;
}

export type UpdateKeywordRequest = Partial<CreateKeywordRequest>;

export type KeywordResponse = ApiResponse<Keyword>;
export type KeywordsResponse = ApiResponse<Keyword[]>;

// ===== SKILL INTERFACES =====

export interface Skill {
  id: number;
  title: string;
  active: boolean;
}

export interface CreateSkillRequest {
  skills: string[];
}

export type UpdateSkillRequest = Partial<CreateSkillRequest>;

export type SkillResponse = ApiResponse<Skill>;
export type SkillsResponse = ApiResponse<Skill[]>;

// ===== INCLUSION INTERFACES =====

export interface Inclusion {
  id: number;
  title: string;
  active?: boolean;
  // Back-compat (older backend responses returned a join table payload)
  Users?: { id: string; UserInclusion: { active: boolean; id: number } }[];
}

export interface CreateInclusionsRequest {
  inclusions: string[];
}

export type InclusionResponse = ApiResponse<Inclusion>;
export type InclusionsResponse = ApiResponse<Inclusion[]>;

// ===== EXCLUSION INTERFACES =====

export interface Exclusion {
  id: number;
  title: string;
  active?: boolean;
  // Back-compat (older backend responses returned a join table payload)
  Users?: { id: string; UserExclusion: { active: boolean; id: number } }[];
}

export interface CreateExclusionsRequest {
  exclusions: string[];
}

export type ExclusionResponse = ApiResponse<Exclusion>;
export type ExclusionsResponse = ApiResponse<Exclusion[]>;

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

export type UserSkillResponse = ApiResponse<UserSkill>;
export type UserSkillsResponse = ApiResponse<UserSkill[]>;

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

export type UserExclusionResponse = ApiResponse<UserExclusion>;
export type UserExclusionsResponse = ApiResponse<UserExclusion[]>;

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

export type UserInclusionResponse = ApiResponse<UserInclusion>;
export type UserInclusionsResponse = ApiResponse<UserInclusion[]>;

// ===== RESUME INTERFACES =====

export interface Resume {
  /* Old DTO according to API Reference: */

  // id: number;
  // user_id: string;
  // first_name: string;
  // last_name: string;
  // email: string;
  // phone: string;
  // address: string;
  // summary?: string;
  // educations?: Education[];
  // work_experiences?: WorkExperience[];
  // resume_skills?: ResumeSkill[];
  // certifications?: Certification[];
  // projects?: Project[];
  // hobbies?: Hobby[];
  // languages?: Language[];
  // references?: Reference[];

  /* New DTO according to API Testing: */
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
  certifications?: Certification[];
  projects?: Project[];
  hobbies?: Hobby[];
  languages?: Language[];
  references?: Reference[];

  // API_REFERENCE.md name; backend may also return resumeSkills (camel) depending on ORM aliases
  resume_skills?: ResumeSkill[];

  // matches Sequelize `as: "resumeSkills"`
  resumeSkills?: Array<{
    id: number;
    resume_id: number;
    skill_id: number;
    skill?: Skill; // note lower-case "skill" matches `as: "skill"`
  }>;
}

// ===== PARSED RESUME (ExpandedResume) =====

export interface ParsedSkill {
  title: string;
}

export interface ExpandedResume extends Resume {
  portfolio_url?: string | null;
  github_url?: string | null;
  linkedin_url?: string | null;
  skills?: ParsedSkill[];
  // Parser output may omit empty arrays and use nulls for unknown values.
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
  skill_id?: number;
  title?: string;
  // Some endpoints return nested Skill under different keys
  Skill?: Skill;
  skill?: Skill;
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

// export type CreateResumeRequest = Omit<Resume, "id" | "user_id">;
// export type UpdateResumeRequest = Partial<CreateResumeRequest>;
export type CreateResumeRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  summary?: string;

  educations?: Array<Omit<Education, "id" | "resume_id">>;
  work_experiences?: Array<Omit<WorkExperience, "id" | "resume_id">>;
  certifications?: Array<Omit<Certification, "id" | "resume_id">>;
  projects?: Array<Omit<Project, "id" | "resume_id">>;
  hobbies?: Array<Omit<Hobby, "id" | "resume_id">>;
  languages?: Array<Omit<Language, "id" | "resume_id">>;
  references?: Array<Omit<Reference, "id" | "resume_id">>;

  resume_skills?: Array<{ skill_id?: number; title?: string }>;
};

export type UpdateResumeRequest = Partial<CreateResumeRequest>;

export type ResumeResponse = ApiResponse<Resume>;

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

export type SearchAndCreateJobsResponse = ApiResponse<string>;

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

// Jobs: markSeen
export interface MarkSeenJobsRequest {
  jobIds: string[];
}

export interface MarkSeenJobsResponse {
  updatedRows: number;
}

// Resumes: add/remove skills
export interface AddResumeSkillsRequest {
  skills?: string[];
  skill_ids?: number[];
}

export interface MessageResponse {
  message: string;
}

// User job approval update request
export type UpdateUserJobsApprovalRequest = Record<string, never>;

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

// Filters: explicit per-user inclusion/exclusion activation
export interface SetUserFilterActiveRequest {
  id: string;
  active: boolean;
}
