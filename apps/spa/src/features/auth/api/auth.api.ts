import { authApiClient } from "@/lib/api/api-client";
import type {
  ApiResponse,
  LoginResponse,
  RefreshResponse,
  UserProfile,
} from "@/lib/api/types";
import type { LoginInput } from "../schemas/login.schema";

export async function loginApi(credentials: LoginInput) {
  const { data } = await authApiClient.post<ApiResponse<LoginResponse>>(
    "/auth/signin",
    credentials,
  );
  return data.data;
}

export async function refreshTokenApi() {
  const { data } =
    await authApiClient.post<ApiResponse<RefreshResponse>>("/auth/refresh");
  return data.data;
}

export async function getMeApi() {
  const { data } =
    await authApiClient.get<ApiResponse<UserProfile>>("/auth/me");
  return data.data;
}

export async function logoutApi() {
  const { data } =
    await authApiClient.post<ApiResponse<{ message: string }>>("/auth/logout");
  return data.data;
}

export async function changePasswordApi(dto: {
  currentPassword: string;
  newPassword: string;
}) {
  const { data } = await authApiClient.patch<ApiResponse<{ message: string }>>(
    "/auth/change-password",
    dto,
  );
  return data.data;
}

export async function updateProfileApi(dto: {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}) {
  const { data } = await authApiClient.patch<ApiResponse<any>>(
    "/auth/profile",
    dto,
  );
  return data.data;
}
