import { apiService } from "../api";
import * as apiTypes from "@/@types/api";

export const jobDescriptionApi = {
  getAllJobDescriptions: (): Promise<apiTypes.JobDescription[]> =>
    apiService.get("/jobDescriptions/getAll"),

  getJobDescriptionById: (id: string): Promise<apiTypes.JobDescription> =>
    apiService.get(`/jobDescriptions/getById/${id}`),

  createJobDescription: (
    data: apiTypes.CreateJobDescriptionRequest
  ): Promise<apiTypes.JobDescription> =>
    apiService.post("/jobDescriptions/create", data),
};
