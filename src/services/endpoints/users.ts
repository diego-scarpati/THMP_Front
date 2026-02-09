import { apiService } from "../api";
import * as apiTypes from "@/@types/api";

export const userApi = {
  createUser: (userData: apiTypes.CreateUserRequest): Promise<apiTypes.User> =>
    apiService.post("/users/createUser", userData),

  loginUser: (
    credentials: apiTypes.LoginRequest
  ): Promise<apiTypes.LoginResponse> =>
    apiService.post("/users/loginUser", credentials),

  getUser: (id: string): Promise<apiTypes.User> =>
    apiService.get(`/users/user/${id}`),

  getUserKeywords: (): Promise<string[]> => apiService.get("/users/keywords"),
};
