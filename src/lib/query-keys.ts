import { PaginationParams } from '@/types/api'

// Query key factory for better cache management and invalidation
export const queryKeys = {
  // Jobs
  jobs: {
    all: ['jobs'] as const,
    lists: () => [...queryKeys.jobs.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.jobs.lists(), params] as const,
    details: () => [...queryKeys.jobs.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.jobs.details(), id] as const,
    byCompany: (companyName: string) => [...queryKeys.jobs.all, 'byCompany', companyName] as const,
    byAcceptance: (formulaAcceptance?: string, gptAcceptance?: string) => 
      [...queryKeys.jobs.all, 'byAcceptance', formulaAcceptance, gptAcceptance] as const,
    applied: () => [...queryKeys.jobs.all, 'applied'] as const,
    rejected: () => [...queryKeys.jobs.all, 'rejected'] as const,
    approved: () => [...queryKeys.jobs.all, 'approved'] as const,
  },

  // Job Descriptions
  jobDescriptions: {
    all: ['jobDescriptions'] as const,
    lists: () => [...queryKeys.jobDescriptions.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.jobDescriptions.lists(), params] as const,
    details: () => [...queryKeys.jobDescriptions.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.jobDescriptions.details(), id] as const,
  },

  // Keywords
  keywords: {
    all: ['keywords'] as const,
    lists: () => [...queryKeys.keywords.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.keywords.lists(), params] as const,
    details: () => [...queryKeys.keywords.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.keywords.details(), id] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  inclusions: {
    all: ['inclusions'] as const,
    lists: () => [...queryKeys.inclusions.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.inclusions.lists(), params] as const,
  },
  exclusions: {
    all: ['exclusions'] as const,
    lists: () => [...queryKeys.exclusions.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.exclusions.lists(), params] as const,
  },
  userJobs: {
    all: ['userJobs'] as const,
    byUser: (userId: string) => [...queryKeys.userJobs.all, 'byUser', userId] as const,
    byJob: (jobId: string) => [...queryKeys.userJobs.all, 'byJob', jobId] as const,
  },
  jobKeywords: {
    all: ['jobKeywords'] as const,
    byJob: (jobId: string) => [...queryKeys.jobKeywords.all, 'byJob', jobId] as const,
    byKeyword: (keywordId: number) => [...queryKeys.jobKeywords.all, 'byKeyword', keywordId] as const,
  },
  userSkills: {
    all: ['userSkills'] as const,
    byUser: (userId: string) => [...queryKeys.userSkills.all, 'byUser', userId] as const,
  },
  userExclusions: {
    all: ['userExclusions'] as const,
    byUser: (userId: string) => [...queryKeys.userExclusions.all, 'byUser', userId] as const,
  },
  userInclusions: {
    all: ['userInclusions'] as const,
    byUser: (userId: string) => [...queryKeys.userInclusions.all, 'byUser', userId] as const,
  },
  skills: {
    all: ['skills'] as const,
    lists: () => [...queryKeys.skills.all, 'list'] as const,
    list: (params?: PaginationParams) => [...queryKeys.skills.lists(), params] as const,
  },
  resumes: {
    all: ['resumes'] as const,
    details: () => [...queryKeys.resumes.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.resumes.details(), id] as const,
    byUser: (userId: string) => [...queryKeys.resumes.all, 'byUser', userId] as const,
  },
} as const

// Mutation keys for consistency
export const mutationKeys = {
  jobs: {
    create: ['jobs', 'create'] as const,
    update: ['jobs', 'update'] as const,
    delete: ['jobs', 'delete'] as const,
    bulkCreate: ['jobs', 'bulkCreate'] as const,
    searchAndCreate: ['jobs', 'searchAndCreate'] as const,
    searchAndCreateWithAllKeywords: ['jobs', 'searchAndCreateWithAllKeywords'] as const,
    approveByFormula: ['jobs', 'approveByFormula'] as const,
    approveByGPT: ['jobs', 'approveByGPT'] as const,
    updateApprovedByDate: ['jobs', 'updateApprovedByDate'] as const,
    saveToFile: ['jobs', 'saveToFile'] as const,
  },
  jobDescriptions: {
    create: ['jobDescriptions', 'create'] as const,
    update: ['jobDescriptions', 'update'] as const,
    delete: ['jobDescriptions', 'delete'] as const,
    loopAndCreate: ['jobDescriptions', 'loopAndCreate'] as const,
  },
  users: {
    create: ['users', 'create'] as const,
    update: ['users', 'update'] as const,
    delete: ['users', 'delete'] as const,
    login: ['users', 'login'] as const,
    logout: ['users', 'logout'] as const,
  },
  userJobs: {
    create: ['userJobs', 'create'] as const,
    update: ['userJobs', 'update'] as const,
    delete: ['userJobs', 'delete'] as const,
    updateCoverLetter: ['userJobs', 'updateCoverLetter'] as const,
    updateApprovalStatus: ['userJobs', 'updateApprovalStatus'] as const,
  },
  keywords: {
    create: ['keywords', 'create'] as const,
    update: ['keywords', 'update'] as const,
    delete: ['keywords', 'delete'] as const,
  },
  resumes: {
    create: ['resumes', 'create'] as const,
    update: ['resumes', 'update'] as const,
    delete: ['resumes', 'delete'] as const,
  },
  inclusions: {
    create: ['inclusions', 'create'] as const,
    delete: ['inclusions', 'delete'] as const,
  },
  exclusions: {
    create: ['exclusions', 'create'] as const,
    delete: ['exclusions', 'delete'] as const,
  },
} as const