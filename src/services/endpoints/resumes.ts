import { apiService } from "../api";
import * as apiTypes from "@/@types/api";

export const resumeApi = {
  getResume: (): Promise<apiTypes.Resume> => apiService.get("/resumes"),

  createResume: (data: apiTypes.CreateResumeRequest): Promise<apiTypes.Resume> =>
    apiService.post("/resumes", data),

  updateResume: (data: apiTypes.UpdateResumeRequest): Promise<apiTypes.Resume> =>
    apiService.put("/resumes", data),

  addResumeSkills: (
    data: apiTypes.AddResumeSkillsRequest
  ): Promise<apiTypes.MessageResponse> => apiService.post("/resumes/skills", data),

  deleteResumeSkill: (skill: string | number): Promise<void> =>
    apiService.delete(`/resumes/skills/${encodeURIComponent(String(skill))}`),

  deleteResume: (): Promise<void> => apiService.delete("/resumes"),

  parseResume: (formData: FormData): Promise<apiTypes.ExpandedResume> =>
    apiService.post("/resumes/parseResume", formData),
};
