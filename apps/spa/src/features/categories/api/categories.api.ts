import { apiClient } from "@/lib/api/api-client";
import type { ApiResponse, PaginationMeta } from "@/lib/api/types";
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "../types/category.types";

const BASE = "/inventory/categories";

export async function fetchCategories(page = 1, limit = 20) {
  const { data } = await apiClient.get<
    ApiResponse<Category[]> & { meta: PaginationMeta }
  >(BASE, { params: { page, limit } });
  return { data: data.data, meta: data.meta };
}

export async function fetchCategory(id: string) {
  const { data } = await apiClient.get<ApiResponse<Category>>(`${BASE}/${id}`);
  return data.data;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const { data } = await apiClient.post<ApiResponse<Category>>(BASE, payload);
  return data.data;
}

export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
) {
  const { data } = await apiClient.patch<ApiResponse<Category>>(
    `${BASE}/${id}`,
    payload,
  );
  return data.data;
}

export async function deleteCategory(id: string) {
  await apiClient.delete(`${BASE}/${id}`);
}
