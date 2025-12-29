// Job-related hooks
export {
  useJobs,
  useJob,
  useJobsByCompany,
  useJobsByAcceptance,
  useAppliedJobs,
  useRejectedJobs,
  useSearchAndCreateJobs,
  useSearchAndCreateWithAllKeywords,
  useApproveJobByFormula,
  useApproveJobByGPT,
  useUpdateApprovedByDate,
  useSeekAllKeywords,
  useUpdateUserJobsApprovalByFormula,
  useSeekSearch,
  useApproveJobByLLM,
} from "./use-jobs";

// User-related hooks
export {
  useCurrentUser,
  useCreateUser,
  useLoginUser,
  useLogoutUser,
  useUserKeywords,
} from "./use-users";

// Job Description hooks
export {
  useJobDescriptions,
  useJobDescription,
  useCreateJobDescription,
} from "./use-job-descriptions";

// Resume hooks
export {
  useResume,
  useCreateResume,
  useUpdateResume,
  useDeleteResume,
  useParseResume,
} from "./use-resumes";

// Skill hooks
export {
  useSkills,
  useCreateSkill,
  useDeleteSkill,
} from "./use-skills";

// Filter hooks
export {
  useToggleFilterActive,
  useSetInclusionsActive,
  useSetExclusionsActive,
} from "./use-filters";

// Keyword hooks
export {
  useUserKeywords as useAllUserKeywords, // Alias to avoid conflict if needed, but use-users has useUserKeywords too?
  useKeywords,
  useKeyword,
  useCreateKeyword,
  useUpdateKeyword,
  useDeleteKeyword,
} from "./use-keywords";

// Inclusion hooks
export {
  useInclusions,
  useCreateInclusion,
  useDeleteInclusion,
  useUserInclusions,
} from "./use-inclusions";

// Exclusion hooks
export {
  useExclusions,
  useCreateExclusion,
  useDeleteExclusion,
  useUserExclusions,
} from "./use-exclusions";
