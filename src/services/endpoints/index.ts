import { jobApi } from "./jobs";
import { jobDescriptionApi } from "./job-descriptions";
import { userApi } from "./users";
import { keywordApi } from "./keywords";
import { skillApi } from "./skills";
import { inclusionApi } from "./inclusions";
import { exclusionApi } from "./exclusions";
import { filterApi } from "./filters";
import { resumeApi } from "./resumes";

export {
  jobApi,
  jobDescriptionApi,
  userApi,
  keywordApi,
  skillApi,
  inclusionApi,
  exclusionApi,
  filterApi,
  resumeApi,
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
