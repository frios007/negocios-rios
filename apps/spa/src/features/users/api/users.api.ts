import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  ManagedUser,
  ManagedUserDetail,
  CreateUserPayload,
  UpdateUserPayload,
  AssignUserPayload,
} from "../types/user.types";

const BASE = "/users";

export async function fetchUsers(page = 1, limit = 200) {
  const { data } = await apiClient.get<
    ApiResponse<ManagedUser[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function fetchUser(id: string) {
  const { data } = await apiClient.get<ApiResponse<ManagedUserDetail>>(
    `${BASE}/${id}`,
  );
  return data.data;
}

export async function createUser(payload: CreateUserPayload) {
  const { data } = await apiClient.post<ApiResponse<ManagedUser>>(
    BASE,
    payload,
  );
  return data.data;
}

export async function updateUser(id: string, payload: UpdateUserPayload) {
  const { data } = await apiClient.patch<ApiResponse<ManagedUser>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}

export async function toggleUserStatus(id: string) {
  const { data } = await apiClient.patch<ApiResponse<ManagedUser>>(
    `${BASE}/${id}/toggle-status`,
  );
  return data.data;
}

export async function updateUserRole(id: string, role: string) {
  const { data } = await apiClient.patch<ApiResponse<any>>(
    `${BASE}/${id}/role`,
    { role },
  );
  return data.data;
}

export async function assignUserToBU(id: string, payload: AssignUserPayload) {
  const { data } = await apiClient.post<ApiResponse<any>>(
    `${BASE}/${id}/assign`,
    payload,
  );
  return data.data;
}

export async function unassignUserFromBU(userId: string, buId: string) {
  const { data } = await apiClient.delete<ApiResponse<any>>(
    `${BASE}/${userId}/unassign/${buId}`,
  );
  return data.data;
}

export async function resetUserPassword(id: string, newPassword: string) {
  const { data } = await apiClient.patch<ApiResponse<any>>(
    `${BASE}/${id}/reset-password`,
    { newPassword },
  );
  return data.data;
}
