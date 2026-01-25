import { apiService } from "../api";
import * as apiTypes from "@/types/api";

export const skillApi = {
  getAllSkills: (): Promise<apiTypes.Skill[]> => apiService.get("/skills"),

  createSkill: (
    data: apiTypes.CreateSkillRequest
  ): Promise<{ message: string }> => apiService.post("/skills", data),

  deleteSkill: (skill: string): Promise<void> =>
    apiService.delete(`/skills/${skill}`),
};
